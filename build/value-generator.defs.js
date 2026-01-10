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
  getFallbackValueGenerator: () => getFallbackValueGenerator
});
module.exports = __toCommonJS(value_generator_defs_exports);
const getFallbackValueGenerator = () => {
  return (sd, _) => {
    if (sd.commonType === "number") {
      return Math.random();
    }
    if (sd.commonType === "string") {
      return Math.random().toFixed(2);
    }
    if (sd.commonType === "boolean") {
      return Math.random() > 0.5;
    }
    return Math.random();
  };
};
const FallbackValueGenerator = (sd) => `${sd.device.name}.${sd.state.name}#${Math.random()}`;
const getToggleBoolValueGenerator = () => {
  return (_, val) => !val;
};
const getNumberRangeGenerator = (min, max, decimals) => {
  return (_1, _2) => {
    return Number((Math.random() * (max - min) + min).toFixed(decimals));
  };
};
const getRandomNumberGenerator = () => {
  return getNumberRangeGenerator(0, 2e4, 2);
};
const adjustType = (inputValueGen, convert) => {
  return (dsd, val) => convert(inputValueGen(dsd, val));
};
const commonValueGenerators = [
  { u: "%", t: "number", gen: getNumberRangeGenerator(0, 100, 2) },
  { u: "Hz", t: "number", gen: getNumberRangeGenerator(5e3, 15e3, 0) },
  { u: "V", t: "number", gen: getNumberRangeGenerator(80, 150, 1) },
  { u: "W", t: "number", gen: getNumberRangeGenerator(20, 500, 0) },
  { u: "Wh", t: "number", gen: getNumberRangeGenerator(20, 500, 0) },
  { u: "km/h", t: "number", gen: getNumberRangeGenerator(5, 20, 2) },
  { u: "lux", t: "number", gen: getRandomNumberGenerator() },
  { u: "mA", t: "number", gen: getRandomNumberGenerator() },
  { u: "mbar", t: "number", gen: getRandomNumberGenerator() },
  { u: "sec", t: "number", gen: getNumberRangeGenerator(0, 300, 0) },
  { u: "\xB0", t: "number", gen: getRandomNumberGenerator() },
  /* Longitude & Latidue */
  {
    u: "\xB0",
    t: "number",
    /* d: 'location', */
    s: ["LONGITUDE"],
    gen: getNumberRangeGenerator(-180, 180, 5)
  },
  {
    u: "\xB0",
    t: "number",
    /* d: 'location', */
    s: ["LATITUDE"],
    gen: getNumberRangeGenerator(-90, 90, 5)
  },
  { u: "\xB0", t: "string", gen: adjustType(getRandomNumberGenerator(), (num) => num.toFixed(2)) },
  { u: "\xB0C", t: "number", gen: getNumberRangeGenerator(-5, 35, 1) },
  {
    u: "%%CUSTOM%%",
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["RED", "GREEN", "BLUE", "WHITE"],
    gen: getNumberRangeGenerator(0, 255, 0)
  },
  {
    u: "%%CUSTOM%%",
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["TEMPERATURE"],
    gen: getNumberRangeGenerator(0, 1e3, 0)
  },
  {
    u: "%%CUSTOM%%",
    t: "string",
    s: ["WORKING", "ERROR"],
    gen: (sd, _) => sd.state.name === "WORKING" ? "YES" : "NO"
  },
  { u: "%%TYPE_MATCH%%", t: "number", gen: getRandomNumberGenerator(), isFallback: true },
  { u: "%%TYPE_MATCH%%", t: "string", gen: FallbackValueGenerator, isFallback: true },
  /* Booleans can never be fallbacks */
  {
    u: "%%TYPE_MATCH%%",
    t: "boolean",
    gen: getToggleBoolValueGenerator(),
    isFallback: false
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonValueGenerators,
  getFallbackValueGenerator
});
//# sourceMappingURL=value-generator.defs.js.map
