import type { ExternalDetectorState } from '@iobroker/type-detector';

export const crossProduct = <A, B>(as: readonly A[], bs: readonly B[]): Array<readonly [A, B]> => {
	const result: Array<readonly [A, B]> = [];
	for (const a of as) {
		for (const b of bs) {
			result.push([a, b] as const);
		}
	}
	return result;
};

export const getStateType = (state: ExternalDetectorState, fallback?: ioBroker.CommonType): ioBroker.CommonType => {
	return Array.isArray(state.type) ? state.type[0] : (state.type ?? fallback ?? 'string');
};

export const summarizeStateDefinition = (sd: ioBroker.DeviceStateDefinition): string => {
	return `${sd.device.name}:${sd.state.name} (Type=${sd.commonType})`;
};

export const printMissingDefaultRoleMarkdown = (states: ioBroker.StateWithDeviceRef[]): void => {
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
