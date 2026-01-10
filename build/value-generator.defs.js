"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var value_generator_defs_exports = {};
__export(value_generator_defs_exports, {
  commonValueGenerators: () => commonValueGenerators,
  fallbackValueGenerators: () => fallbackValueGenerators
});
module.exports = __toCommonJS(value_generator_defs_exports);
var import_constants = require("./constants");
var import_value_generators = require("./value-generators");
const fallbackValueGenerators = [
  { u: import_constants.UNIT__TYPE_MATCH, t: "number", ...(0, import_value_generators.RandomNumber)(), isFallback: true },
  {
    u: import_constants.UNIT__TYPE_MATCH,
    t: "string",
    gen: (0, import_value_generators.adjustType)((0, import_value_generators.getFallbackValueGenerator)(), (v) => {
      var _a;
      return (_a = v == null ? void 0 : v.toString()) != null ? _a : "N/A";
    }),
    isFallback: true
  },
  {
    u: import_constants.UNIT__TYPE_MATCH,
    t: "boolean",
    ...(0, import_value_generators.Toggle)(),
    isFallback: false
  }
];
const commonValueGenerators = [
  { u: "%", t: "number", ...(0, import_value_generators.NumberRange)(0, 100, 2) },
  { u: "Hz", t: "number", ...(0, import_value_generators.NumberRange)(5e3, 15e3, 0) },
  { u: "V", t: "number", ...(0, import_value_generators.NumberRange)(80, 150, 1) },
  { u: "W", t: "number", ...(0, import_value_generators.NumberRange)(20, 500, 0) },
  { u: "Wh", t: "number", ...(0, import_value_generators.NumberRange)(20, 500, 0) },
  { u: "km/h", t: "number", ...(0, import_value_generators.NumberRange)(5, 20, 2) },
  { u: "lux", t: "number", ...(0, import_value_generators.NumberRange)(0, 1e5, 0) },
  { u: "mA", t: "number", ...(0, import_value_generators.NumberRange)(100, 500, 0) },
  { u: "mbar", t: "number", ...(0, import_value_generators.NumberRange)(950, 1050, 1) },
  { u: "sec", t: "number", ...(0, import_value_generators.NumberRange)(0, 300, 0) },
  { u: "\xB0", t: "number", ...(0, import_value_generators.NumberRange)(0, 359, 1) },
  { u: "\xB0", t: "string", ...(0, import_value_generators.AdjustType)((0, import_value_generators.NumberRange)(0, 359, 1), (num) => num.toFixed(2)) },
  { u: "\xB0C", t: "number", ...(0, import_value_generators.NumberRange)(-5, 35, 1) },
  { u: "\xB0K", t: "number", ...(0, import_value_generators.NumberRange)(2e3, 6500, 0) },
  /* Longitude & Latitude */
  { u: "\xB0", t: "number", d: ["location"], s: ["LONGITUDE"], ...(0, import_value_generators.NumberRange)(-180, 180, 5) },
  { u: "\xB0", t: "number", d: ["location"], s: ["LATITUDE"], ...(0, import_value_generators.NumberRange)(-90, 90, 5) },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["RED", "GREEN", "BLUE", "WHITE"],
    ...(0, import_value_generators.NumberRange)(0, 255, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["TEMPERATURE"],
    ...(0, import_value_generators.NumberRange)(0, 1e3, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    s: ["WORKING", "ERROR"],
    gen: (sd, _) => sd.state.name === "WORKING" ? "YES" : "NO",
    description: "'YES' or 'NO'"
  },
  // Proposals for TODO states - add to commonValueGenerators array
  // Air Conditioner states
  {
    u: "mA",
    t: "number",
    d: ["airCondition"],
    s: ["CURRENT"],
    ...(0, import_value_generators.NumberRange)(100, 2e3, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["airCondition"],
    s: ["MODE"],
    ...(0, import_value_generators.NumberRange)(0, 4, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["airCondition"],
    s: ["SPEED"],
    ...(0, import_value_generators.NumberRange)(1, 100, 0)
  },
  {
    u: "lux",
    t: "number",
    d: ["illuminance"],
    s: ["ACTUAL"],
    ...(0, import_value_generators.NumberRange)(0, 1e5, 0)
  },
  // GPS/Location states
  {
    u: "m",
    t: "number",
    d: ["location", "locationOne"],
    s: ["ACCURACY"],
    ...(0, import_value_generators.NumberRange)(1, 50, 0)
  },
  {
    u: "m",
    t: "number",
    d: ["location", "locationOne"],
    s: ["ELEVATION"],
    ...(0, import_value_generators.NumberRange)(-100, 4e3, 0)
  },
  { u: import_constants.UNIT__CUSTOM, t: "number", d: ["weatherCurrent"], s: ["UV"], ...(0, import_value_generators.NumberRange)(0, 11, 0) },
  // Vacuum cleaner states
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["vacuumCleaner"],
    s: ["STATE"],
    ...(0, import_value_generators.NumberRange)(0, 5, 0),
    description: "Num[0..5#P0] (0=idle,1=docked,2=error,3=cleaning,4=paused,5=returning)"
  },
  { u: import_constants.UNIT__CUSTOM, t: "number", d: ["vacuumCleaner"], s: ["MODE"], ...(0, import_value_generators.NumberRange)(0, 3, 0) },
  // Transition times (all devices)
  {
    u: "ms",
    t: "number",
    d: ["cie", "ct", "dimmer", "hue", "rgb", "rgbSingle", "rgbwSingle"],
    s: ["TRANSITION_TIME"],
    ...(0, import_value_generators.NumberRange)(0, 1e4, 0)
  },
  // Media strings (generate simple random media content)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["mediaPlayer"],
    s: ["ALBUM", "ARTIST", "TITLE", "TRACK", "EPISODE", "SEASON"],
    gen: () => ["Track 1", "Artist X", "Album Y", "Season 1", "Episode 5"][Math.floor(Math.random() * 5)]
  },
  ...fallbackValueGenerators
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonValueGenerators,
  fallbackValueGenerators
});
//# sourceMappingURL=value-generator.defs.js.map
