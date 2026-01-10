import { commonValueGenerators } from './value-generator.defs';

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

export const getValueGenerator = (
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
