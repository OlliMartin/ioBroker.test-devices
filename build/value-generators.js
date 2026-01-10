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
var value_generators_exports = {};
__export(value_generators_exports, {
  adjustType: () => adjustType,
  getFallbackValueGenerator: () => getFallbackValueGenerator,
  getNumberRangeGenerator: () => getNumberRangeGenerator,
  getRandomNumberGenerator: () => getRandomNumberGenerator,
  getToggleBoolValueGenerator: () => getToggleBoolValueGenerator
});
module.exports = __toCommonJS(value_generators_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustType,
  getFallbackValueGenerator,
  getNumberRangeGenerator,
  getRandomNumberGenerator,
  getToggleBoolValueGenerator
});
//# sourceMappingURL=value-generators.js.map
