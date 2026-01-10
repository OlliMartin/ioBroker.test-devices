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
  { u: import_constants.UNIT__TYPE_MATCH, t: "number", gen: (0, import_value_generators.getRandomNumberGenerator)(), isFallback: true },
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
    gen: (0, import_value_generators.getToggleBoolValueGenerator)(),
    isFallback: false
  }
];
const commonValueGenerators = [
  { u: "%", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(0, 100, 2) },
  { u: "Hz", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(5e3, 15e3, 0) },
  { u: "V", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(80, 150, 1) },
  { u: "W", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(20, 500, 0) },
  { u: "Wh", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(20, 500, 0) },
  { u: "km/h", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(5, 20, 2) },
  { u: "lux", t: "number", gen: (0, import_value_generators.getRandomNumberGenerator)() },
  { u: "mA", t: "number", gen: (0, import_value_generators.getRandomNumberGenerator)() },
  { u: "mbar", t: "number", gen: (0, import_value_generators.getRandomNumberGenerator)() },
  { u: "sec", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(0, 300, 0) },
  { u: "\xB0", t: "number", gen: (0, import_value_generators.getRandomNumberGenerator)() },
  /* Longitude & Latidue */
  { u: "\xB0", t: "number", d: ["location"], s: ["LONGITUDE"], gen: (0, import_value_generators.getNumberRangeGenerator)(-180, 180, 5) },
  { u: "\xB0", t: "number", d: ["location"], s: ["LATITUDE"], gen: (0, import_value_generators.getNumberRangeGenerator)(-90, 90, 5) },
  { u: "\xB0", t: "string", gen: (0, import_value_generators.adjustType)((0, import_value_generators.getRandomNumberGenerator)(), (num) => num.toFixed(2)) },
  { u: "\xB0C", t: "number", gen: (0, import_value_generators.getNumberRangeGenerator)(-5, 35, 1) },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["RED", "GREEN", "BLUE", "WHITE"],
    gen: (0, import_value_generators.getNumberRangeGenerator)(0, 255, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["TEMPERATURE"],
    gen: (0, import_value_generators.getNumberRangeGenerator)(0, 1e3, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    s: ["WORKING", "ERROR"],
    gen: (sd, _) => sd.state.name === "WORKING" ? "YES" : "NO"
  },
  ...fallbackValueGenerators
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonValueGenerators,
  fallbackValueGenerators
});
//# sourceMappingURL=value-generator.defs.js.map
