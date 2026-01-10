import { commonValueGenerators } from './value-generator.defs';
import { UNIT__CUSTOM, UNIT__TYPE_MATCH } from './constants';
import { getFallbackValueGenerator } from './value-generators';

const getValueGeneratorRelevance = (vg: ioBroker.ValueGeneratorDefinition): number => {
	let result = 0;
	if (vg.u !== UNIT__CUSTOM && vg.u !== UNIT__TYPE_MATCH) {
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

export const getValueGenerator = (
	stateDefinition: ioBroker.DeviceStateDefinition,
	trackGeneratorCb?: (sd: ioBroker.DeviceStateDefinition, vg: ioBroker.ValueGeneratorDefinition[]) => void,
): ioBroker.ValueGenerator<ioBroker.StateValue> => {
	trackGeneratorCb ??= (sd: ioBroker.DeviceStateDefinition, vg: ioBroker.ValueGeneratorDefinition[]): void => {
		if (vg.length > 1) {
			console.log(
				`Warning: Identified more than one value generator for ${sd.device.name}:${sd.state.name} (${sd.commonType}).`,
			);
			return;
		}

		if (!vg[0].isFallback) {
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
		trackGeneratorCb(stateDefinition, exactGeneratorMatches);
		return exactGeneratorMatches[0].gen;
	} else if (exactGeneratorMatches.length > 1) {
		const genSortedByApplicability = exactGeneratorMatches.sort(
			(a, b) => getValueGeneratorRelevance(b) - getValueGeneratorRelevance(a),
		);

		if (
			getValueGeneratorRelevance(genSortedByApplicability[0]) ==
			getValueGeneratorRelevance(genSortedByApplicability[1])
		) {
			trackGeneratorCb(stateDefinition, genSortedByApplicability);
			return genSortedByApplicability[0].gen;
		}

		trackGeneratorCb(stateDefinition, [genSortedByApplicability[0]]);
		return genSortedByApplicability[0].gen;
	}

	const customMatches = commonValueGenerators.filter(
		vgDef =>
			vgDef.u === '%%CUSTOM%%' &&
			vgDef.t === stateDefinition.commonType &&
			(vgDef.d === undefined || vgDef.d.includes(stateDefinition.device.name)) &&
			(vgDef.s === undefined || vgDef.s.includes(stateDefinition.state.name)),
	);

	if (customMatches.length === 1) {
		trackGeneratorCb(stateDefinition, customMatches);
		return customMatches[0].gen;
	}

	const typeMatches = commonValueGenerators.filter(
		vgDef => vgDef.u === '%%TYPE_MATCH%%' && vgDef.t === stateDefinition.commonType,
	);

	if (typeMatches.length === 1) {
		trackGeneratorCb(stateDefinition, typeMatches);
		return typeMatches[0].gen;
	}

	return getFallbackValueGenerator();
};
