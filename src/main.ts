import * as utils from '@iobroker/adapter-core';
import ChannelDetector, { type DetectOptions, type ExternalDetectorState } from '@iobroker/type-detector';

// Heck, I can't get typescript to enforce that the array here consists of all properties of the type.
// If a new type is introduced one line above, it must be added here too :/
const generationTypes: ioBroker.GenerationTypes = ['all', 'required'];

const deviceFilter: ioBroker.DeviceFilterType = {
	all: (_1, _2) => true,
	required: (_, s) => !!s.required,
};

const detector: ChannelDetector = new ChannelDetector();

const deviceTypeBlacklist: string[] = ['chart'];

export const getDeviceMetadata: () => ioBroker.DeviceDefinition[] = () => {
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

const getFallbackValueGenerator = (): ioBroker.ValueGenerator<ioBroker.StateValue> => {
	return (sd, _) => {
		if (sd.commonType === 'number') {
			return Math.random();
		}
		if (sd.commonType === 'string') {
			return Math.random().toFixed(2);
		}
		if (sd.commonType === 'boolean') {
			return Math.random() > 0.5;
		}

		return Math.random();
	};
};

const FallbackValueGenerator: ioBroker.ValueGenerator<string> = sd =>
	`${sd.device.name}.${sd.state.name}#${Math.random()}`;

const getToggleBoolValueGenerator = (): ioBroker.ValueGenerator<boolean> => {
	return (_, val) => !val;
};

const getNumberRangeGenerator = (min: number, max: number, decimals: number): ioBroker.ValueGenerator<number> => {
	return (_1, _2) => {
		return Number((Math.random() * (max - min) + min).toFixed(decimals));
	};
};

const getRandomNumberGenerator = (): ioBroker.ValueGenerator<number> => {
	return getNumberRangeGenerator(0, 20000, 2);
};

const adjustType = <TIn extends ioBroker.StateValue, TOut extends ioBroker.StateValue>(
	inputValueGen: ioBroker.ValueGenerator<TIn>,
	convert: (intermediate: TIn) => TOut,
): ioBroker.ValueGenerator<TOut> => {
	return (dsd, val) => convert(inputValueGen(dsd, val));
};

const commonValueGenerators: ioBroker.ValueGeneratorDefinition[] = [
	{ u: '%', t: 'number', gen: getNumberRangeGenerator(0, 100, 2) },
	{ u: 'Hz', t: 'number', gen: getNumberRangeGenerator(5000, 15000, 0) },
	{ u: 'V', t: 'number', gen: getNumberRangeGenerator(80, 150, 1) },
	{ u: 'W', t: 'number', gen: getNumberRangeGenerator(20, 500, 0) },
	{ u: 'Wh', t: 'number', gen: getNumberRangeGenerator(20, 500, 0) },
	{ u: 'km/h', t: 'number', gen: getNumberRangeGenerator(5, 20, 2) },
	{ u: 'lux', t: 'number', gen: getRandomNumberGenerator() },
	{ u: 'mA', t: 'number', gen: getRandomNumberGenerator() },
	{ u: 'mbar', t: 'number', gen: getRandomNumberGenerator() },
	{ u: 'sec', t: 'number', gen: getNumberRangeGenerator(0, 300, 0) },
	{ u: '°', t: 'number', gen: getRandomNumberGenerator() },

	/* Longitude & Latidue */
	{ u: '°', t: 'number', /* d: 'location', */ s: ['LONGITUDE'], gen: getNumberRangeGenerator(-180, +180, 5) },
	{ u: '°', t: 'number', /* d: 'location', */ s: ['LATITUDE'], gen: getNumberRangeGenerator(-90, +90, 5) },

	{ u: '°', t: 'string', gen: adjustType(getRandomNumberGenerator(), num => num.toFixed(2)) },
	{ u: '°C', t: 'number', gen: getNumberRangeGenerator(-5, 35, 1) },

	{
		u: '%%CUSTOM%%',
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['RED', 'GREEN', 'BLUE', 'WHITE'],
		gen: getNumberRangeGenerator(0, 255, 0),
	},
	{
		u: '%%CUSTOM%%',
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['TEMPERATURE'],
		gen: getNumberRangeGenerator(0, 1000, 0),
	} /* I'm guessing Kelvin? What's the UOM here? */,

	{
		u: '%%CUSTOM%%',
		t: 'string',
		s: ['WORKING', 'ERROR'],
		gen: (sd, _) => (sd.state.name === 'WORKING' ? 'YES' : 'NO'),
	},

	{ u: '%%TYPE_MATCH%%', t: 'number', gen: getRandomNumberGenerator(), isFallback: true },
	{ u: '%%TYPE_MATCH%%', t: 'string', gen: FallbackValueGenerator, isFallback: true },

	/* Booleans can never be fallbacks */
	{
		u: '%%TYPE_MATCH%%',
		t: 'boolean',
		gen: getToggleBoolValueGenerator(),
		isFallback: false,
	},
];

const getValueGeneratorRelevance = (vg: ioBroker.ValueGeneratorDefinition): number => {
	let result = 0;
	if (vg.u !== '%%CUSTOM%%' && vg.u !== '%%TYPE_MATCH%%') {
		result += 2;
	}

	if (vg.d) {
		result += 3;
	}

	if (vg.s) {
		result += 1;
	}
	return result;
};

const getValueGenerator = (
	stateDefinition: ioBroker.DeviceStateDefinition,
): ioBroker.ValueGenerator<ioBroker.StateValue> | undefined => {
	const logFallback = (sd: ioBroker.DeviceStateDefinition, vg: ioBroker.ValueGeneratorDefinition): void => {
		if (!vg.isFallback) {
			return;
		}
		console.log(`Warning: Fallback used for ${sd.device.name}:${sd.state.name} (${sd.commonType}).`);
	};

	const exactGeneratorMatches = commonValueGenerators.filter(
		vgDef =>
			vgDef.u === stateDefinition.state.defaultUnit &&
			vgDef.t === stateDefinition.commonType &&
			(vgDef.d === undefined || vgDef.d.includes(stateDefinition.device.name)) &&
			(vgDef.s === undefined || vgDef.s.includes(stateDefinition.state.name)),
	);

	if (exactGeneratorMatches.length === 1) {
		logFallback(stateDefinition, exactGeneratorMatches[0]);
		return exactGeneratorMatches[0].gen;
	} else if (exactGeneratorMatches.length > 1) {
		const genWithHighestSpecification = exactGeneratorMatches.sort(
			(a, b) => getValueGeneratorRelevance(b) - getValueGeneratorRelevance(a),
		);

		return genWithHighestSpecification[0].gen;
	}

	const customMatches = commonValueGenerators.filter(
		vgDef =>
			vgDef.u === '%%CUSTOM%%' &&
			vgDef.t === stateDefinition.commonType &&
			(vgDef.d === undefined || vgDef.d.includes(stateDefinition.device.name)) &&
			(vgDef.s === undefined || vgDef.s.includes(stateDefinition.state.name)),
	);

	if (customMatches.length === 1) {
		logFallback(stateDefinition, customMatches[0]);
		return customMatches[0].gen;
	}

	const typeMatches = commonValueGenerators.filter(
		vgDef => vgDef.u === '%%TYPE_MATCH%%' && vgDef.t === stateDefinition.commonType,
	);

	if (typeMatches.length === 1) {
		logFallback(stateDefinition, typeMatches[0]);
		return typeMatches[0].gen;
	}

	return undefined;
};

export const createDesiredStateDefinitions = (
	namespace: string,
	config: ioBroker.AdapterConfig,
	validDevices: ioBroker.DeviceDefinition[],
): Record<string, ioBroker.DeviceStateDefinition> => {
	const getDeviceType = (genType: ioBroker.DeviceStatesGenerationType): string =>
		`${namespace}.${TestDevices.GetDeviceFolderName()}.${genType}`;
	const getDeviceRoot = (genType: ioBroker.DeviceStatesGenerationType, device: ioBroker.DeviceDefinition): string =>
		`${getDeviceType(genType)}.${device.name}`;

	// 'NoOp' for now
	const getFilterContext = (device: ioBroker.DeviceDefinition): ioBroker.DeviceFilterContext => {
		return { device, config: config };
	};

	const isReadOnly = (state: ExternalDetectorState): boolean =>
		(!!state.read || state.read === undefined) && !state.write;

	const stateCacheMemory: ioBroker.DeviceStateDefinition[] = crossProduct(generationTypes, validDevices)
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
				.map(s => ({
					...m,
					state: s,
					read: s.read ?? true,
					write: s.write ?? false,
					stateFqn: `${m.deviceRoot}.${s.name}`,
					commonType: getStateType(s),
					isReadOnly: isReadOnly(s),
					valueGenerator: undefined,
				})),
		)
		.reduce((prev, curr) => [...prev, ...curr], [])
		.map(sd => ({
			...sd,
			valueGenerator: getValueGenerator(sd) ?? getFallbackValueGenerator(),
		}));

	return stateCacheMemory.reduce((prev, curr) => ({ ...prev, [curr.stateFqn]: curr }), {});
};

class TestDevices extends utils.Adapter {
	private static deviceFolderName: string = 'devices';
	private static triggerFolderName: string = 'triggers';

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

		const triggerChangeRegex = `^${this.namespace.replace('.', '\\.')}\\.${TestDevices.GetTriggerFolderName()}\\.((${generationTypes.join('|')})\\.([^\\.]*))$`;
		this.logLater(`Constructed trigger change regex: ${triggerChangeRegex}`);

		const deviceChangeRegex = `^${this.namespace}\\.${TestDevices.GetDeviceFolderName()}\\.(${generationTypes.join('|')})\\.([^\\.]*)\\.([^\\.]*)$`;
		this.logLater(`Constructed device change regex: ${deviceChangeRegex}`);

		this.triggerChangeRegex = new RegExp(triggerChangeRegex);
		this.deviceStateChangeRegex = new RegExp(deviceChangeRegex);
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

	private async createDeviceChangeTriggersAsync(validDevices: ioBroker.DeviceDefinition[]): Promise<void> {
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
		const objResult = await this.getForeignObjects(`${this.namespace}.${TestDevices.GetDeviceFolderName()}.*`);

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
