import { UNIT__CUSTOM, UNIT__TYPE_MATCH } from './constants';
import {
	AdjustType,
	adjustType,
	getFallbackValueGenerator,
	NumberRange,
	RandomNumber,
	Toggle,
} from './value-generators';

export const fallbackValueGenerators: ioBroker.ValueGeneratorDefinition[] = [
	{ u: UNIT__TYPE_MATCH, t: 'number', ...RandomNumber(), isFallback: true },
	{
		u: UNIT__TYPE_MATCH,
		t: 'string',
		gen: adjustType(getFallbackValueGenerator(), v => v?.toString() ?? 'N/A'),
		isFallback: true,
	},
	{
		u: UNIT__TYPE_MATCH,
		t: 'boolean',
		...Toggle(),

		isFallback: false,
	},
];

export const commonValueGenerators: ioBroker.ValueGeneratorDefinition[] = [
	{ u: '%', t: 'number', ...NumberRange(0, 100, 2) },
	{ u: 'Hz', t: 'number', ...NumberRange(5000, 15000, 0) },
	{ u: 'V', t: 'number', ...NumberRange(80, 150, 1) },
	{ u: 'W', t: 'number', ...NumberRange(20, 500, 0) },
	{ u: 'Wh', t: 'number', ...NumberRange(20, 500, 0) },
	{ u: 'km/h', t: 'number', ...NumberRange(5, 20, 2) },
	{ u: 'lux', t: 'number', ...RandomNumber() },
	{ u: 'mA', t: 'number', ...RandomNumber() },
	{ u: 'mbar', t: 'number', ...RandomNumber() },
	{ u: 'sec', t: 'number', ...NumberRange(0, 300, 0) },
	{ u: '°', t: 'number', ...RandomNumber() },

	/* Longitude & Latidue */
	{ u: '°', t: 'number', d: ['location'], s: ['LONGITUDE'], ...NumberRange(-180, +180, 5) },
	{ u: '°', t: 'number', d: ['location'], s: ['LATITUDE'], ...NumberRange(-90, +90, 5) },

	{ u: '°', t: 'string', ...AdjustType(RandomNumber(), num => num.toFixed(2)) },
	{ u: '°C', t: 'number', ...NumberRange(-5, 35, 1) },

	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['RED', 'GREEN', 'BLUE', 'WHITE'],
		...NumberRange(0, 255, 0),
	},
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['rgb', 'rgbwSingle'],
		s: ['TEMPERATURE'],
		...NumberRange(0, 1000, 0),
	} /* I'm guessing Kelvin? What's the UOM here? */,

	{
		u: UNIT__CUSTOM,
		t: 'string',
		s: ['WORKING', 'ERROR'],
		gen: (sd, _) => (sd.state.name === 'WORKING' ? 'YES' : 'NO'),
		description: "'YES' or 'NO'",
	},

	...fallbackValueGenerators,
];
