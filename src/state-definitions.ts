import type { ExternalDetectorState } from '@iobroker/type-detector';
import { crossProduct, getStateType } from './utils';
import { deviceFilter, generationTypes, GetDeviceFolderName } from './constants';
import { getValueGenerator } from './value-generator-factory';
import { getFallbackValueGenerator } from './value-generators';

export const createDesiredStateDefinitions = (
	namespace: string,
	config: ioBroker.AdapterConfig,
	validDevices: ioBroker.DeviceDefinition[],
	trackGeneratorCb?: (sd: ioBroker.DeviceStateDefinition, vg: ioBroker.ValueGeneratorDefinition[]) => void,
): Record<string, ioBroker.DeviceStateDefinition> => {
	const getDeviceType = (genType: ioBroker.DeviceStatesGenerationType): string =>
		`${namespace}.${GetDeviceFolderName()}.${genType}`;
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
			valueGenerator: getValueGenerator(sd, trackGeneratorCb) ?? getFallbackValueGenerator(),
		}));

	return stateCacheMemory.reduce((prev, curr) => ({ ...prev, [curr.stateFqn]: curr }), {});
};
