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

// Not used for now; May be handy in the future.
interface DeviceFilterContext {
	device: DeviceDefinition;
}

interface DeviceStateDefinition {
	state: ExternalDetectorState;
	stateFqn: string;
	context: DeviceFilterContext;
	deviceType: string;
	deviceRoot: string;
	generationType: DeviceStatesGenerationType;
	device: DeviceDefinition;
	commonType: ioBroker.CommonType;
}

type DeviceStatesGenerationType = 'all' | 'required';

// Heck, I can't get typescript to enfoce that the array here consists of all properties of the type.
// If a new type is introduced one line above, it must be added here too :/
const generationTypes: GenerationTypes = ['all', 'required'];

type GenerationTypes = readonly DeviceStatesGenerationType[];

type DeviceFilterType = Record<
	DeviceStatesGenerationType,
	(ctx: DeviceFilterContext, state: ExternalDetectorState) => boolean
>;

const deviceFilter: DeviceFilterType = {
	all: (_1, _2) => true,
	required: (_, s) => !!s.required,
};

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

const crossProduct = <A, B>(as: readonly A[], bs: readonly B[]): Array<readonly [A, B]> => {
	const result: Array<readonly [A, B]> = [];
	for (const a of as) {
		for (const b of bs) {
			result.push([a, b] as const);
		}
	}
	return result;
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
	private static deviceFolderName: string = 'devices';
	private static triggerFolderName: string = 'triggers';

	private readonly validDevices: DeviceDefinition[];
	private readonly stateLookup: Record<string, DeviceStateDefinition>;

	private readonly stateNames: string[] = [];

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'test-devices',
		});
		this.on('message', this.onMessage.bind(this));
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));

		const startMs = Date.now();
		const allDevices = getDeviceMetadata();

		this.analyzeAllStates(allDevices);

		const deviceNamesWithMissingDefaultRoles = this.getDeviceNamesMissingDefaultRoles(allDevices);
		this.analyzeDuplicateDefaultRoles(allDevices);

		this.validDevices = allDevices.filter(d => !deviceNamesWithMissingDefaultRoles.includes(d.name));

		this.stateLookup = this.createDesiredStateDefinitions(this.validDevices);
		this.stateNames = Object.keys(this.stateLookup);

		this.logLater(`Discovering desired states took ${Date.now() - startMs}ms.`);
	}

	private createDesiredStateDefinitions(validDevices: DeviceDefinition[]): Record<string, DeviceStateDefinition> {
		const getDeviceType = (genType: DeviceStatesGenerationType): string =>
			`${this.namespace}.${TestDevices.GetDeviceFolderName()}.${genType}`;
		const getDeviceRoot = (genType: DeviceStatesGenerationType, device: DeviceDefinition): string =>
			`${getDeviceType(genType)}.${device.name}`;

		// 'NoOp' for now
		const getFilterContext = (device: DeviceDefinition): DeviceFilterContext => {
			return { device };
		};

		const stateCacheMemory: DeviceStateDefinition[] = crossProduct(generationTypes, validDevices)
			.map(arr => ({
				generationType: arr[0],
				device: arr[1],
			}))
			.map(m => ({
				...m,
				context: getFilterContext(m.device),
				deviceType: getDeviceType(m.generationType),
				deviceRoot: getDeviceRoot(m.generationType, m.device),
			}))
			.map(m =>
				m.device.states
					.filter(s => deviceFilter[m.generationType](m.context, s))
					.map(s => ({ ...m, state: s, stateFqn: `${m.deviceRoot}.${s.name}`, commonType: getStateType(s) })),
			)
			.reduce((prev, curr) => [...prev, ...curr], []);

		return stateCacheMemory.reduce((prev, curr) => ({ ...prev, [curr.stateFqn]: curr }), {});
	}

	public static GetDeviceFolderName(): string {
		return TestDevices.deviceFolderName;
	}

	public static GetTriggerFolderName(): string {
		return TestDevices.triggerFolderName;
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
		}

		this.log.info(`Stored state count: ${this.stateNames.length}.`);

		this.setConnected(true);
		this.log.info(`Start-up finished within ${Date.now() - startMs}ms.`);
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
						read: stateDef.state.read ?? true,
						write: stateDef.state.write ?? false,
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

	private async createMetaStatesForDevicesAsync(devices: DeviceDefinition[]): Promise<void> {
		await Promise.all(
			crossProduct(generationTypes, devices).map(d => this.createMetaStatesForDeviceAsync(d[1], d[0])),
		);
	}

	private async createMetaStatesForDeviceAsync(
		device: DeviceDefinition,
		prefix: DeviceStatesGenerationType,
	): Promise<void> {
		const deviceType = `${this.namespace}.${TestDevices.GetDeviceFolderName()}.${prefix}`;
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

	private async createDeviceChangeTriggersAsync(validDevices: DeviceDefinition[]): Promise<void> {
		this.log.debug(`Creating triggers for ${validDevices.length} devices`);

		const startMs = Date.now();
		const triggerFolder = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;

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
				await this.createOrUpdateSingleDeviceTriggerAsync(
					device,
					TestDevices.GetTriggerFolderName(),
					generationType,
				);
			}
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

	private logMessages: string[] = [];
	private logLater(message: string): void {
		this.logMessages.push(message);
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

		this.logLater(`State count total: ${allStates.length}`);

		const statesWithoutDefaultRole = allStates.filter(s => !s.defaultRole);

		if (statesWithoutDefaultRole.length > 0) {
			this.logLater(
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

	private getDeviceNamesMissingDefaultRoles(allDevices: DeviceDefinition[]): string[] {
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
