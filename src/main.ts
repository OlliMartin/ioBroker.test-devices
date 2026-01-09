import * as utils from '@iobroker/adapter-core';
import ChannelDetector, { type ExternalDetectorState, type Types } from '@iobroker/type-detector';

type DeviceDefinition = {
	states: ExternalDetectorState[];
	type: Types;
	enumRequired?: boolean;
	name: string;
};

class TestDevices extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'test-devices',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));

		this.config.test.unknown = [];
	}

	private async onReady(): Promise<void> {
		const knownPatterns = ChannelDetector.getPatterns();

		const allDevices = Object.entries(knownPatterns).map(([k, v]) => ({
			...v,
			name: k,
		}));

		console.log(
			'State count total:',
			allDevices.map(d => d.states).reduce((prev, curr) => [...prev, ...curr], []).length,
		);

		const devicesWithMissingDefaultRoles = allDevices.filter(
			d => d.states.filter(s => s.required && !s.defaultRole).length > 0,
		);

		const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map(d => d.name);

		if (devicesWithMissingDefaultRoles.length > 0) {
			this.log.warn(
				`Found ${devicesWithMissingDefaultRoles.length} devices with missing default roles: [${deviceNamesWithMissingDefaultRoles.join(
					', ',
				)}] These will be skipped.`,
			);
		}

		const validDevices: DeviceDefinition[] = allDevices.filter(
			d => !deviceNamesWithMissingDefaultRoles.includes(d.name),
		);

		this.log.info(`Creating states for ${validDevices.length} devices`);

		let createdStates = 0;
		const startMs = Date.now();
		for (const device of validDevices) {
			createdStates += await this.createOrUpdateSingleDeviceAsync(device);
		}

		this.log.info(
			`Done. Created ${createdStates} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`,
		);
	}

	private async createOrUpdateSingleDeviceAsync(device: DeviceDefinition): Promise<number> {
		const deviceRoot = `${this.namespace}.${device.name}`;
		await this.extendObject(deviceRoot, {
			type: 'channel',
			common: {
				name: device.name,
			},
		});

		let createdStates = 0;
		for (const state of device.states.filter(s => s.required)) {
			const stateName = `${deviceRoot}.${state.name}`;
			const type = Array.isArray(state.type) ? state.type[0] : (state.type ?? 'string');
			await this.extendObject(stateName, {
				type: 'state',
				common: {
					name: state.name,
					type: type,
					read: state.read ?? true,
					write: state.write ?? false,
					role: state.defaultRole,
					unit: state.defaultUnit,
				},
			});

			createdStates++;
		}

		return createdStates;
	}

	private onUnload(callback: () => void): void {
		try {
			// nothing to do yet
		} catch (error) {
			this.log.error(`Error during unloading: ${(error as Error).message}`);
		} finally {
			callback();
		}
	}
}
if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TestDevices(options);
} else {
	// otherwise start the instance directly
	(() => new TestDevices())();
}
