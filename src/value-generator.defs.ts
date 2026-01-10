import { UNIT__CUSTOM, UNIT__TYPE_MATCH } from './constants';
import {
	adjustType,
	getFallbackValueGenerator,
	getNumberRangeGenerator,
	getRandomNumberGenerator,
	getToggleBoolValueGenerator,
} from './value-generators';

export const fallbackValueGenerators: ioBroker.ValueGeneratorDefinition[] = [
	{ u: UNIT__TYPE_MATCH, t: 'number', gen: getRandomNumberGenerator(), isFallback: true },
	{
		u: UNIT__TYPE_MATCH,
		t: 'string',
		gen: adjustType(getFallbackValueGenerator(), v => v?.toString() ?? 'N/A'),
		isFallback: true,
	},
	{
		u: UNIT__TYPE_MATCH,
		t: 'boolean',
		gen: getToggleBoolValueGenerator(),

		isFallback: false,
	},
];

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
	{ u: '°', t: 'number', d: ['location'], s: ['LONGITUDE'], gen: getNumberRangeGenerator(-180, +180, 5) },
	{ u: '°', t: 'number', d: ['location'], s: ['LATITUDE'], gen: getNumberRangeGenerator(-90, +90, 5) },

	{ u: '°', t: 'string', gen: adjustType(getRandomNumberGenerator(), num => num.toFixed(2)) },
	{ u: '°C', t: 'number', gen: getNumberRangeGenerator(-5, 35, 1) },

	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['RED', 'GREEN', 'BLUE', 'WHITE'],
		gen: getNumberRangeGenerator(0, 255, 0),
	},
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['TEMPERATURE'],
		gen: getNumberRangeGenerator(0, 1000, 0),
	} /* I'm guessing Kelvin? What's the UOM here? */,

	{
		u: UNIT__CUSTOM,
		t: 'string',
		s: ['WORKING', 'ERROR'],
		gen: (sd, _) => (sd.state.name === 'WORKING' ? 'YES' : 'NO'),
	},

	...fallbackValueGenerators,
];
