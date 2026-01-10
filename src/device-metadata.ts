import ChannelDetector from '@iobroker/type-detector';

export const deviceTypeBlacklist: string[] = ['chart'];

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
