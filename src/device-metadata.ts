import ChannelDetector from '@iobroker/type-detector';

export const deviceTypeBlacklist: string[] = ['chart'];

export const getDeviceNamesMissingDefaultRoles = (
	allDevices: ioBroker.DeviceDefinition[],
	logCb: (msg: string) => void,
): string[] => {
	const devicesWithMissingDefaultRoles = allDevices.filter(
		d => d.states.filter(s => s.required && !s.defaultRole).length > 0,
	);

	const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map(d => d.name);

	if (devicesWithMissingDefaultRoles.length > 0) {
		logCb(
			`Found ${devicesWithMissingDefaultRoles.length} devices with missing default roles: [${deviceNamesWithMissingDefaultRoles.join(
				', ',
			)}] These will be skipped.`,
		);
	}

	return deviceNamesWithMissingDefaultRoles;
};

export const getDeviceMetadata: (logCb: (msg: string) => void) => ioBroker.DeviceDefinition[] = logCb => {
	const knownPatterns = ChannelDetector.getPatterns();

	const allDevices = Object.entries(knownPatterns)
		.filter(([k, _]) => !deviceTypeBlacklist.includes(k))
		.map(([k, v]) => ({
			...v,
			states: v.states.filter(s => !!s.defaultRole),
			name: k,
		}));

	const deviceNamesWithMissingDefaultRoles = getDeviceNamesMissingDefaultRoles(allDevices, logCb);
	return allDevices.filter(d => !deviceNamesWithMissingDefaultRoles.includes(d.name));
};
