import * as utils from '@iobroker/adapter-core';
import ChannelDetector, { type DetectOptions, type ExternalDetectorState, type Types } from '@iobroker/type-detector';

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

type DeviceStatesGenerationType = 'all' | 'required';

const detector: ChannelDetector = new ChannelDetector();

const deviceTypeBlacklist: string[] = ['chart'];

const getDeviceMetadata: () => DeviceDefinition[] = () => {
	const knownPatterns = ChannelDetector.getPatterns();

	return Object.entries(knownPatterns)
		.filter(([k, _]) => !deviceTypeBlacklist.includes(k))
		.map(([k, v]) => ({
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
		this.on('message', this.onMessage.bind(this));
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	private static deviceFolderName: string = 'devices';
	private static triggerFolderName: string = 'triggers';

	private stateNames: string[] = [];

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
		await this.createAllDevicesAsync(validDevices);
		await this.createDeviceChangeTriggersAsync(validDevices);

		this.log.info(`Stored state count: ${this.stateNames.length}.`);

		this.setConnected(true);
	}

	private readonly validCommands: string[] = ['VERIFY_DEVICE_TYPE', 'GET_DEVICE_STATES'];

	private async onMessage(message: ioBroker.Message): Promise<void> {
		if (!this.validCommands.includes(message.command) || !message.callback) {
			this.log.info(`Dropping unknown command '${message.command}'.`);
			this.sendTo(message.from, message.command, 'INVALID_COMMAND', message.callback);
			return;
		}

		if (message.command === 'VERIFY_DEVICE_TYPE') {
			const deviceType = message.message as string;
			this.log.debug(`Verifying device type match for ${deviceType}.`);
			const result = await this.verifyCreatedDeviceAsync(deviceType);

			this.sendTo(message.from, message.command, result ? 'SUCCESS' : 'FAIL', message.callback);
		} else if (message.command === 'GET_DEVICE_STATES') {
			this.log.debug('Collecting device states.');
			this.sendTo(message.from, message.command, this.stateNames, message.callback);
		}
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

	private async createAllDevicesAsync(validDevices: DeviceDefinition[]): Promise<void> {
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

	private trackCreatedState(fqStateName: string): void {
		this.stateNames.push(fqStateName);
	}

	private async createOrUpdateSingleDeviceAsync(
		device: DeviceDefinition,
		folderName: string,
		prefix: DeviceStatesGenerationType,
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

		const created = await Promise.all(allPromises);
		created.forEach(({ id }) => this.trackCreatedState(id));

		return allPromises.length;
	}

	private async createDeviceChangeTriggersAsync(validDevices: DeviceDefinition[]): Promise<void> {
		this.log.info(`Creating triggers for ${validDevices.length} devices`);

		const startMs = Date.now();
		const triggerFolder = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;

		for (const generationType of ['required', 'all']) {
			await this.extendObject(`${triggerFolder}.${generationType}`, {
				type: 'folder',
				common: {
					name: generationType,
				},
			});
		}

		for (const device of validDevices) {
			await this.createOrUpdateSingleDeviceTriggerAsync(device, TestDevices.GetTriggerFolderName(), 'required');
			await this.createOrUpdateSingleDeviceTriggerAsync(device, TestDevices.GetTriggerFolderName(), 'all');
		}

		this.log.info(`Done. Created ${validDevices.length} device triggers in ${Date.now() - startMs}ms.`);
	}

	private async createOrUpdateSingleDeviceTriggerAsync(
		device: DeviceDefinition,
		folderName: string,
		prefix: DeviceStatesGenerationType,
	): Promise<void> {
		const deviceType = `${this.namespace}.${folderName}.${prefix}.${device.name}`;
		await this.extendObject(deviceType, {
			type: 'state',
			common: {
				name: device.name,
				type: 'boolean',
				role: 'button',
				read: false,
				write: true,
			},
		});
	}

	private objectsLastRead: number | null = null;
	private objectCache: Record<string, ioBroker.Object> | null = null;

	private async getObjectsCachedAsync(): Promise<Record<string, ioBroker.Object>> {
		if (this.objectCache && this.objectsLastRead && Date.now() - this.objectsLastRead < 60 * 1000) {
			return this.objectCache;
		}

		this.objectsLastRead = Date.now();
		this.objectCache = await this.getForeignObjects(`${this.namespace}.${TestDevices.GetDeviceFolderName()}.*`);

		this.log.debug(
			`Read ${Object.keys(this.objectCache).length} objects in ${Date.now() - this.objectsLastRead}ms.`,
		);

		return this.objectCache;
	}

	private async verifyCreatedDeviceAsync(deviceType: string): Promise<boolean> {
		const objects = await this.getObjectsCachedAsync();

		const deviceGenerationTypes: DeviceStatesGenerationType[] = ['all', 'required'];

		let result = true;
		for (const generationType of deviceGenerationTypes) {
			const prefix = `${this.namespace}.${TestDevices.GetDeviceFolderName()}.${generationType}`;

			const expectedId = `${prefix}.${deviceType}`;

			const options: DetectOptions = {
				objects: objects,
				id: expectedId,
			};

			const controls = detector.detect(options);

			if (!controls) {
				this.log.debug(`No matches found for ${options.id}`);
				result = false;
			} else if (controls && controls.length > 1) {
				const foundDeviceTypes = controls.map(c => c.type).join(', ');
				if (foundDeviceTypes.includes(deviceType)) {
					continue;
				}

				this.log.debug(
					`Too many matches found for ${options.id}, but none of them matches expected type '${deviceType}': [${foundDeviceTypes}]`,
				);

				result = false;
			}
		}

		return result;
	}

	private onUnload(callback: () => void): void {
		try {
			this.setConnected(false);
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

	private setConnected(isConnected: boolean): void {
		void this.setState('info.connection', isConnected, true, error =>
			// analyse if the state could be set (because of permissions)
			error
				? this.log.error(`Can not update this._connected state: ${error}`)
				: this.log.debug(`connected set to ${isConnected}`),
		);
	}
}
if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TestDevices(options);
} else {
	// otherwise start the instance directly
	(() => new TestDevices())();
}
