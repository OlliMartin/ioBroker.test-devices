import * as utils from '@iobroker/adapter-core';
import ChannelDetector, { type DetectOptions, type ExternalDetectorState } from '@iobroker/type-detector';
import { getDeviceMetadata } from './device-metadata';
import { crossProduct, getStateType } from './utils';
import { createDesiredStateDefinitions } from './state-definitions';
import { generationTypes, GetDeviceFolderName, GetTriggerFolderName } from './constants';
import { getFallbackValueGenerator } from './value-generators';

const detector: ChannelDetector = new ChannelDetector();

const printMissingDefaultRoleMarkdown = (states: ioBroker.StateWithDeviceRef[]): void => {
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
	private readonly validDevices: ioBroker.DeviceDefinition[];
	private readonly stateLookup: Record<string, ioBroker.DeviceStateDefinition>;

	private readonly stateNames: string[] = [];

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'test-devices',
		});
		this.on('message', this.onMessage.bind(this));
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('unload', this.onUnload.bind(this));

		const startMs = Date.now();
		const allDevices = getDeviceMetadata();

		this.analyzeAllStates(allDevices);

		const deviceNamesWithMissingDefaultRoles = this.getDeviceNamesMissingDefaultRoles(allDevices);
		this.analyzeDuplicateDefaultRoles(allDevices);

		this.validDevices = allDevices.filter(d => !deviceNamesWithMissingDefaultRoles.includes(d.name));

		this.stateLookup = createDesiredStateDefinitions(this.namespace, this.config, this.validDevices);
		this.stateNames = Object.keys(this.stateLookup);

		this.logLater(`Discovering desired states took ${Date.now() - startMs}ms.`);

		const triggerChangeRegex = `^${this.namespace.replace('.', '\\.')}\\.${GetTriggerFolderName()}\\.((${generationTypes.join('|')})\\.([^\\.]*))$`;
		this.logLater(`Constructed trigger change regex: ${triggerChangeRegex}`);

		const deviceChangeRegex = `^${this.namespace}\\.${GetDeviceFolderName()}\\.(${generationTypes.join('|')})\\.([^\\.]*)\\.([^\\.]*)$`;
		this.logLater(`Constructed device change regex: ${deviceChangeRegex}`);

		this.triggerChangeRegex = new RegExp(triggerChangeRegex);
		this.deviceStateChangeRegex = new RegExp(deviceChangeRegex);
	}

	private async onReady(): Promise<void> {
		for (const msg of this.logMessages) {
			this.log.info(msg);
		}
		this.logMessages = [];

		const startMs = Date.now();

		const objectCache = await this.getObjectsCachedAsync();

		await this.createTopLevelFoldersAsync();
		await this.createDeviceChangeTriggersAsync(this.validDevices);
		await this.createMetaStatesForDevicesAsync(this.validDevices);

		const foundInDb = Object.keys(objectCache);
		if (this.stateNames.every(requestedDeviceStateName => foundInDb.includes(requestedDeviceStateName))) {
			this.log.debug(
				`Device states unchanged from last start. Want: ${this.stateNames.length} Have: ${foundInDb.length}. Skipping creation.`,
			);
		} else {
			this.log.debug(
				`Actual device states deviate from desired state. Want: ${this.stateNames.length} Have: ${foundInDb.length}. Recreating all.`,
			);
			await this.createAllDevicesAsync(this.validDevices);
			this.objectCache = null; // Force cache reload for good measure
			void this.getObjectsCachedAsync();
		}

		this.log.info(`Stored state count: ${this.stateNames.length}.`);

		this.setConnected(true);
		this.log.info(`Start-up finished within ${Date.now() - startMs}ms.`);

		this.subscribeStates(`${this.namespace}.*`);
	}

	private readonly validCommands: string[] = ['VERIFY_DEVICE_TYPE', 'GET_DEVICE_STATES'];

	private readonly triggerChangeRegex: RegExp;
	private readonly deviceStateChangeRegex: RegExp;
	private readonly setReadOnlyStatesOnly: boolean = false; // TODO OMA 2026-01-10: Read from config?
	private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
		if (!state || state.ack) {
			return;
		}

		if (this.triggerChangeRegex.test(id)) {
			const startMs = Date.now();
			const match = this.triggerChangeRegex.exec(id);
			if (!match || match.length < 4) {
				return;
			}

			const genType = match[2];
			const device = match[3];

			const allStates = Object.values(this.stateLookup).filter(
				sd => sd.generationType === genType && sd.device.name === device,
			);
			const relevantStates = allStates.filter(sd => !this.setReadOnlyStatesOnly || sd.isReadOnly);

			this.log.debug(
				`Received trigger for ${id} -> ${genType}:${device}. ${relevantStates.length} out of ${allStates.length} are relevant (read only).`,
			);

			const handleSingleState = async (sd: ioBroker.DeviceStateDefinition): Promise<void> => {
				const currentValue = await this.getStateAsync(sd.stateFqn);
				const valueGen = sd.valueGenerator ?? getFallbackValueGenerator();
				const nextValue = valueGen(sd, currentValue?.val);

				await this.setState(sd.stateFqn, { val: nextValue, ack: true });
			};

			await Promise.all(relevantStates.map(handleSingleState));

			// ACK
			await this.setState(id, state, true);
			this.log.debug(`Trigger processed in ${Date.now() - startMs}ms.`);
		}

		if (this.deviceStateChangeRegex.test(id)) {
			this.log.debug(`Received state change for device ${id}.`);
			await this.setState(id, state, true);
		}
	}

	private async onMessage(message: ioBroker.Message): Promise<void> {
		if (!this.validCommands.includes(message.command) || !message.callback) {
			this.log.info(`Dropping unknown command '${message.command}'.`);
			this.sendTo(message.from, message.command, 'INVALID_COMMAND', message.callback);
			return;
		}

		if (message.command === 'VERIFY_DEVICE_TYPE') {
			const deviceType = message.message as string;
			const result = await this.verifyCreatedDeviceAsync(deviceType);
			this.sendTo(message.from, message.command, result ? 'SUCCESS' : 'FAIL', message.callback);
		} else if (message.command === 'GET_DEVICE_STATES') {
			this.log.debug('Collecting device states.');
			this.sendTo(message.from, message.command, this.stateNames, message.callback);
		} else if (message.command === 'SIMULATE_SINGLE_DEVICE_CHANGE') {
			this.log.debug('Collecting device states.');
		} else if (message.command === 'SIMULATE_DEVICE_CHANGES') {
			this.log.debug('Collecting device states.');
		}
	}

	private async createTopLevelFoldersAsync(): Promise<void> {
		const fqFolderName = `${this.namespace}.${GetDeviceFolderName()}`;
		const fqTriggerName = `${this.namespace}.${GetTriggerFolderName()}`;

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

	private async createAllDevicesAsync(validDevices: ioBroker.DeviceDefinition[]): Promise<void> {
		const startMs = Date.now();
		this.log.debug(`Creating ${this.stateNames.length} states for ${validDevices.length} devices`);
		const sem = new Semaphore(16);

		const allPromises = Object.values(this.stateLookup).map(stateDef =>
			sem.with(() =>
				this.extendObject(stateDef.stateFqn, {
					type: 'state',
					common: {
						name: stateDef.state.name,
						type: stateDef.commonType,
						read: stateDef.read,
						write: stateDef.write,
						role: stateDef.state.defaultRole,
						unit: stateDef.state.defaultUnit,
					},
				}),
			),
		);

		await Promise.all(allPromises);
		this.log.info(
			`Created ${this.stateNames.length} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`,
		);
	}

	private async createMetaStatesForDevicesAsync(devices: ioBroker.DeviceDefinition[]): Promise<void> {
		await Promise.all(
			crossProduct(generationTypes, devices).map(d => this.createMetaStatesForDeviceAsync(d[1], d[0])),
		);
	}

	private async createMetaStatesForDeviceAsync(
		device: ioBroker.DeviceDefinition,
		prefix: ioBroker.DeviceStatesGenerationType,
	): Promise<void> {
		const deviceType = `${this.namespace}.${GetDeviceFolderName()}.${prefix}`;
		await this.extendObject(deviceType, {
			type: 'device',
			common: {
				name: device.name,
			},
		});

		const deviceRoot = `${deviceType}.${device.name}`;
		await this.extendObject(deviceRoot, {
			type: 'channel',
			common: {
				name: device.name,
			},
		});
	}

	private async createDeviceChangeTriggersAsync(validDevices: ioBroker.DeviceDefinition[]): Promise<void> {
		this.log.debug(`Creating triggers for ${validDevices.length} devices`);

		const startMs = Date.now();
		const triggerFolder = `${this.namespace}.${GetTriggerFolderName()}`;

		for (const generationType of generationTypes) {
			await this.extendObject(`${triggerFolder}.${generationType}`, {
				type: 'folder',
				common: {
					name: generationType,
				},
			});
		}

		for (const generationType of generationTypes) {
			for (const device of validDevices) {
				await this.createOrUpdateSingleDeviceTriggerAsync(device, GetTriggerFolderName(), generationType);
			}
		}

		this.log.info(`Done. Created ${validDevices.length} device triggers in ${Date.now() - startMs}ms.`);
	}

	private async createOrUpdateSingleDeviceTriggerAsync(
		device: ioBroker.DeviceDefinition,
		folderName: string,
		prefix: ioBroker.DeviceStatesGenerationType,
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
		const objResult = await this.getForeignObjects(`${this.namespace}.${GetDeviceFolderName()}.*`);

		this.log.debug(`Read ${Object.keys(objResult).length} objects in ${Date.now() - this.objectsLastRead}ms.`);

		// Heh, this is a very subtle thing, but has quite a big impact on the integration tests:
		// Right now objects are pre-loaded on adapter start, if it is the first start (always the case in int-tests),
		// we get an empty array, which would be cached for a minute.
		// -> only write to cache if we find objects & invalidate cache on state creation.
		if (Object.keys(objResult).length > 0) {
			this.objectCache = objResult;
		}

		return objResult;
	}

	private async verifyCreatedDeviceAsync(deviceType: string): Promise<boolean> {
		const objects = await this.getObjectsCachedAsync();

		const deviceGenerationTypes: ioBroker.DeviceStatesGenerationType[] = ['all', 'required'];

		let result = true;
		for (const generationType of deviceGenerationTypes) {
			const prefix = `${this.namespace}.${GetDeviceFolderName()}.${generationType}`;

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
			this.log.error(`Unexpected error during unloading: ${(error as Error).message}`);
		} finally {
			callback();
		}
	}

	private logMessages: string[] = [];
	private logLater(message: string): void {
		this.logMessages.push(message);
	}

	private analyzeAllStates(allDevices: ioBroker.DeviceDefinition[]): void {
		const mapState: (
			device: ioBroker.DeviceDefinition,
			state: ExternalDetectorState,
		) => ioBroker.StateWithDeviceRef = (device, state) => ({ ...state, deviceRef: device });

		const allStates = allDevices.reduce(
			(prev: ioBroker.StateWithDeviceRef[], curr) => [...prev, ...curr.states.map(s => mapState(curr, s))],
			[],
		);

		this.logLater(`State count total: ${allStates.length}`);

		const statesWithoutDefaultRole = allStates.filter(s => !s.defaultRole);

		if (statesWithoutDefaultRole.length > 0) {
			this.logLater(
				`States without default role: ${statesWithoutDefaultRole.length} - [${statesWithoutDefaultRole.map(s => s.name).join(', ')}]`,
			);

			printMissingDefaultRoleMarkdown(statesWithoutDefaultRole);
		}
	}

	private analyzeDuplicateDefaultRoles(allDevices: ioBroker.DeviceDefinition[]): void {
		const isDuplicatedDefaultRole = (state: ExternalDetectorState, allStates: ExternalDetectorState[]): boolean => {
			return allStates.filter(sInner => sInner.defaultRole == state.defaultRole).length > 1;
		};

		const devicesWithDuplicateDefaultRoles = allDevices.filter(
			d => d.states.filter(s => isDuplicatedDefaultRole(s, d.states)).length > 0,
		);

		if (devicesWithDuplicateDefaultRoles.length > 0) {
			const deviceNamesWithDuplicateDefaultRoles = devicesWithDuplicateDefaultRoles.map(d => d.name);
			this.logLater(
				`Found ${devicesWithDuplicateDefaultRoles.length} devices with duplicate default roles: [${deviceNamesWithDuplicateDefaultRoles.join(
					', ',
				)}] A state will be generated for each, ignoring the duplication.`,
			);

			for (const device of devicesWithDuplicateDefaultRoles) {
				const duplicatedDefaultRoles = device.states
					.filter(s => isDuplicatedDefaultRole(s, device.states))
					.map(s => `${s.name} -> ${s.defaultRole}`);

				this.logLater(`\t${device.name} -> Duplicate Roles: ${duplicatedDefaultRoles.join(', ')}`);
			}
		}
	}

	private getDeviceNamesMissingDefaultRoles(allDevices: ioBroker.DeviceDefinition[]): string[] {
		const devicesWithMissingDefaultRoles = allDevices.filter(
			d => d.states.filter(s => s.required && !s.defaultRole).length > 0,
		);

		const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map(d => d.name);

		if (devicesWithMissingDefaultRoles.length > 0) {
			this.logLater(
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

class Semaphore {
	private count: number;
	private queue: Array<() => void> = [];

	constructor(maxConcurrency: number) {
		this.count = maxConcurrency;
	}

	async acquire(): Promise<void> {
		if (this.count > 0) {
			this.count--;
			return;
		}

		return new Promise(resolve => {
			this.queue.push(resolve);
		});
	}

	release(): void {
		if (this.queue.length > 0) {
			const next = this.queue.shift()!;
			next();
		} else {
			this.count++;
		}
	}

	// Convenience method
	async with<T>(fn: () => Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await fn();
		} finally {
			this.release();
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
