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
var value_generator_exports = {};
__export(value_generator_exports, {
  getValueGenerator: () => getValueGenerator
});
module.exports = __toCommonJS(value_generator_exports);
var import_value_generator = require("./value-generator.defs");
const getValueGeneratorRelevance = (vg) => {
  let result = 0;
  if (vg.u !== "%%CUSTOM%%" && vg.u !== "%%TYPE_MATCH%%") {
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
const getValueGenerator = (stateDefinition) => {
  const logFallback = (sd, vg) => {
    if (!vg.isFallback) {
      return;
    }
    console.log(`Warning: Fallback used for ${sd.device.name}:${sd.state.name} (${sd.commonType}).`);
  };
  const exactGeneratorMatches = import_value_generator.commonValueGenerators.filter(
    (vgDef) => vgDef.u === stateDefinition.state.defaultUnit && vgDef.t === stateDefinition.commonType && (vgDef.d === void 0 || vgDef.d.includes(stateDefinition.device.name)) && (vgDef.s === void 0 || vgDef.s.includes(stateDefinition.state.name))
  );
  if (exactGeneratorMatches.length === 1) {
    logFallback(stateDefinition, exactGeneratorMatches[0]);
    return exactGeneratorMatches[0].gen;
  } else if (exactGeneratorMatches.length > 1) {
    const genWithHighestSpecification = exactGeneratorMatches.sort(
      (a, b) => getValueGeneratorRelevance(b) - getValueGeneratorRelevance(a)
    );
    return genWithHighestSpecification[0].gen;
  }
  const customMatches = import_value_generator.commonValueGenerators.filter(
    (vgDef) => vgDef.u === "%%CUSTOM%%" && vgDef.t === stateDefinition.commonType && (vgDef.d === void 0 || vgDef.d.includes(stateDefinition.device.name)) && (vgDef.s === void 0 || vgDef.s.includes(stateDefinition.state.name))
  );
  if (customMatches.length === 1) {
    logFallback(stateDefinition, customMatches[0]);
    return customMatches[0].gen;
  }
  const typeMatches = import_value_generator.commonValueGenerators.filter(
    (vgDef) => vgDef.u === "%%TYPE_MATCH%%" && vgDef.t === stateDefinition.commonType
  );
  if (typeMatches.length === 1) {
    logFallback(stateDefinition, typeMatches[0]);
    return typeMatches[0].gen;
  }
  return void 0;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getValueGenerator
});
//# sourceMappingURL=value-generator.js.map
