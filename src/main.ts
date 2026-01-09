import * as utils from '@iobroker/adapter-core';
import ChannelDetector, { type ExternalDetectorState, type Types } from '@iobroker/type-detector';

type DeviceDefinition = {
	states: ExternalDetectorState[];
	type: Types;
	enumRequired?: boolean;
	name: string;
};

type StateWithDeviceRef = ExternalDetectorState & {
	deviceRef: DeviceDefinition;
};

const getStateType = (state: ExternalDetectorState, fallback?: ioBroker.CommonType): ioBroker.CommonType => {
	return Array.isArray(state.type) ? state.type[0] : (state.type ?? fallback ?? 'string');
};

const printMissingDefaultRoleMarkdown = (states: StateWithDeviceRef[]): void => {
	const sortedStates = [...states] // Assuming sort is stable.
		.sort((a, b) => a.name.localeCompare(b.name))
		.sort((a, b) => a.deviceRef.name.localeCompare(b.deviceRef.name));

	let output = '| Device | Name | Type | Role Regex |\n';
	output += '| - | - | - | - |\n';

	/*                                                                                   *caugh* */
	for (const state of sortedStates) {
		output += `| ${state.deviceRef.name} | ${state.name} | ${getStateType(state, 'N/A' as any)} | \`${state.role}\` |\n`;
	}

	console.log(output);
};

class TestDevices extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'test-devices',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	private async onReady(): Promise<void> {
		const knownPatterns = ChannelDetector.getPatterns();

		const allDevices = Object.entries(knownPatterns).map(([k, v]) => ({
			...v,
			name: k,
		}));

		const mapState: (device: DeviceDefinition, state: ExternalDetectorState) => StateWithDeviceRef = (
			device,
			state,
		) => ({ ...state, deviceRef: device });

		const allStates = allDevices.reduce(
			(prev: StateWithDeviceRef[], curr) => [...prev, ...curr.states.map(s => mapState(curr, s))],
			[],
		);

		this.log.info(`State count total: ${allStates.length}`);

		const statesWithoutDefaultRole = allStates.filter(s => !s.defaultRole);

		if (statesWithoutDefaultRole.length > 0) {
			this.log.info(
				`States without default role: ${statesWithoutDefaultRole.length} - [${statesWithoutDefaultRole.map(s => s.name).join(', ')}]`,
			);

			printMissingDefaultRoleMarkdown(statesWithoutDefaultRole);
		}

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
			const type = getStateType(state);

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
