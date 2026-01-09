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

type StateCreationJob = ExternalDetectorState & {
	fqStateName: string;
	commonType: ioBroker.CommonType;
};

const getDeviceMetadata: () => DeviceDefinition[] = () => {
	const knownPatterns = ChannelDetector.getPatterns();

	return Object.entries(knownPatterns).map(([k, v]) => ({
		...v,
		states: v.states.filter(s => !!s.defaultRole),
		name: k,
	}));
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

	private static deviceFolderName: string = 'devices';
	private static triggerFolderName: string = 'triggers';

	public static GetDeviceFolderName(): string {
		return TestDevices.deviceFolderName;
	}

	public static GetTriggerFolderName(): string {
		return TestDevices.triggerFolderName;
	}

	private async onReady(): Promise<void> {
		const allDevices = getDeviceMetadata();

		this.analyzeAllStates(allDevices);

		const deviceNamesWithMissingDefaultRoles = this.getDeviceNamesMissingDefaultRoles(allDevices);
		this.analyzeDuplicateDefaultRoles(allDevices);

		const validDevices: DeviceDefinition[] = allDevices.filter(
			d => !deviceNamesWithMissingDefaultRoles.includes(d.name),
		);

		await this.createTopLevelFoldersAsync();

		this.log.info(`Creating states for ${validDevices.length} devices`);

		let createdStates = 0;
		const startMs = Date.now();
		for (const device of validDevices) {
			createdStates += await this.createOrUpdateSingleDeviceAsync(
				device,
				TestDevices.GetDeviceFolderName(),
				'required',
				s => !!s.required,
			);
			createdStates += await this.createOrUpdateSingleDeviceAsync(
				device,
				TestDevices.GetDeviceFolderName(),
				'all',
				_ => true,
			);
		}

		this.log.info(
			`Done. Created ${createdStates} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`,
		);
	}

	private async createTopLevelFoldersAsync(): Promise<void> {
		const fqFolderName = `${this.namespace}.${TestDevices.GetDeviceFolderName()}`;
		const fqTriggerName = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;

		await Promise.allSettled([
			this.extendObject(fqTriggerName, {
				type: 'folder',
				common: {
					name: fqTriggerName,
				},
			}),
			this.extendObject(fqFolderName, {
				type: 'folder',
				common: {
					name: fqFolderName,
				},
			}),
		]);
	}

	private async createOrUpdateSingleDeviceAsync(
		device: DeviceDefinition,
		folderName: string,
		prefix: string,
		stateFilter: (state: ExternalDetectorState) => boolean,
	): Promise<number> {
		const deviceType = `${this.namespace}.${folderName}.${prefix}`;
		await this.extendObject(deviceType, {
			type: 'device',
			common: {
				name: device.name,
			},
		});

		const deviceRoot = `${deviceType}.${device.name}`;
		await this.extendObject(deviceType, {
			type: 'channel',
			common: {
				name: deviceRoot,
			},
		});

		const mapStateToJob: (s: ExternalDetectorState) => StateCreationJob = s => {
			return {
				...s,
				fqStateName: `${deviceRoot}.${s.name}`,
				commonType: getStateType(s),
			};
		};

		// concurrency is limited by the device-iterator in onReady.
		// semi-limited. Ok, I just don't want to use a queue, leave me alone.
		const allPromises = device.states
			.filter(stateFilter)
			.map<StateCreationJob>(mapStateToJob)
			.map(state =>
				this.extendObject(state.fqStateName, {
					type: 'state',
					common: {
						name: state.name,
						type: state.commonType,
						read: state.read ?? true,
						write: state.write ?? false,
						role: state.defaultRole,
						unit: state.defaultUnit,
					},
				}),
			);

		await Promise.allSettled(allPromises);

		return allPromises.length;
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

	private analyzeAllStates(allDevices: DeviceDefinition[]): void {
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
	}

	private analyzeDuplicateDefaultRoles(allDevices: DeviceDefinition[]): void {
		const isDuplicatedDefaultRole = (state: ExternalDetectorState, allStates: ExternalDetectorState[]): boolean => {
			return allStates.filter(sInner => sInner.defaultRole == state.defaultRole).length > 1;
		};

		const devicesWithDuplicateDefaultRoles = allDevices.filter(
			d => d.states.filter(s => isDuplicatedDefaultRole(s, d.states)).length > 0,
		);

		if (devicesWithDuplicateDefaultRoles.length > 0) {
			const deviceNamesWithDuplicateDefaultRoles = devicesWithDuplicateDefaultRoles.map(d => d.name);
			this.log.info(
				`Found ${devicesWithDuplicateDefaultRoles.length} devices with duplicate default roles: [${deviceNamesWithDuplicateDefaultRoles.join(
					', ',
				)}] A state will be generated for each, ignoring the duplication.`,
			);

			for (const device of devicesWithDuplicateDefaultRoles) {
				const duplicatedDefaultRoles = device.states
					.filter(s => isDuplicatedDefaultRole(s, device.states))
					.map(s => `${s.name} -> ${s.defaultRole}`);

				this.log.info(`\t${device.name} -> Duplicate Roles: ${duplicatedDefaultRoles.join(', ')}`);
			}
		}
	}

	private getDeviceNamesMissingDefaultRoles(allDevices: DeviceDefinition[]): string[] {
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

		return deviceNamesWithMissingDefaultRoles;
	}
}
if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TestDevices(options);
} else {
	// otherwise start the instance directly
	(() => new TestDevices())();
}
