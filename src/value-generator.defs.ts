export const getFallbackValueGenerator = (): ioBroker.ValueGenerator<ioBroker.StateValue> => {
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

export const commonValueGenerators: ioBroker.ValueGeneratorDefinition[] = [
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
