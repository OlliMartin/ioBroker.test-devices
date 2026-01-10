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
