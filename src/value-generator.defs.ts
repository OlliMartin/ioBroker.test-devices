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
	{ u: 'lux', t: 'number', ...NumberRange(0, 100000, 0) },
	{ u: 'mA', t: 'number', ...NumberRange(100, 500, 0) },
	{ u: 'mbar', t: 'number', ...NumberRange(950, 1050, 1) },
	{ u: 'sec', t: 'number', ...NumberRange(0, 300, 0) },
	{ u: '°', t: 'number', ...NumberRange(0, 359, 1) },
	{ u: '°', t: 'string', ...AdjustType(NumberRange(0, 359, 1), num => num.toFixed(2)) },
	{ u: '°C', t: 'number', ...NumberRange(-5, 35, 1) },
	{ u: '°K', t: 'number', ...NumberRange(2000, 6500, 0) },

	/* Longitude & Latitude */
	{ u: '°', t: 'number', d: ['location'], s: ['LONGITUDE'], ...NumberRange(-180, +180, 5) },
	{ u: '°', t: 'number', d: ['location'], s: ['LATITUDE'], ...NumberRange(-90, +90, 5) },

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
	},

	{
		u: UNIT__CUSTOM,
		t: 'string',
		s: ['WORKING', 'ERROR'],
		gen: (sd, _) => (sd.state.name === 'WORKING' ? 'YES' : 'NO'),
		description: "'YES' or 'NO'",
	},

	// Proposals for TODO states - add to commonValueGenerators array
	// Air Conditioner states
	{
		u: 'mA',
		t: 'number',
		d: ['airCondition'],
		s: ['CURRENT'],
		// The AI thought it's important the air conditioner can draw more current. ¯\_(ツ)_/¯
		...NumberRange(100, 2000, 0),
	},
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['airCondition'],
		s: ['MODE'],
		...NumberRange(0, 4, 0),
	},
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['airCondition'],
		s: ['SPEED'],
		...NumberRange(1, 100, 0),
	},

	{
		u: 'lux',
		t: 'number',
		d: ['illuminance'],
		s: ['ACTUAL'],
		...NumberRange(0, 100000, 0),
	},

	// GPS/Location states
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['location', 'locationOne'],
		s: ['ACCURACY'],
		...NumberRange(1, 50, 0),
	},
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['location', 'locationOne'],
		s: ['ELEVATION'],
		...NumberRange(-100, 4000, 0),
	},

	{ u: UNIT__CUSTOM, t: 'number', d: ['weatherCurrent'], s: ['UV'], ...NumberRange(0, 11, 0) },

	// Vacuum cleaner states
	{
		u: UNIT__CUSTOM,
		t: 'number',
		d: ['vacuumCleaner'],
		s: ['STATE'],
		...NumberRange(0, 5, 0),
		description: 'Num[0..5#P0] (0=idle,1=docked,2=error,3=cleaning,4=paused,5=returning)',
	},
	{ u: UNIT__CUSTOM, t: 'number', d: ['vacuumCleaner'], s: ['MODE'], ...NumberRange(0, 3, 0) },

	// Transition times (all devices)
	{
		u: 'ms',
		t: 'number',
		s: ['TRANSITION_TIME'],
		...NumberRange(0, 10000, 0),
	},

	// Media strings (generate simple random media content)
	{
		u: UNIT__CUSTOM,
		t: 'string',
		d: ['mediaPlayer'],
		s: ['ALBUM', 'ARTIST', 'TITLE', 'TRACK', 'EPISODE', 'SEASON'],
		gen: () => ['Track 1', 'Artist X', 'Album Y', 'Season 1', 'Episode 5'][Math.floor(Math.random() * 5)],
	},

	...fallbackValueGenerators,
];
