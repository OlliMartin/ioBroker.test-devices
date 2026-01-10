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
var utils_exports = {};
__export(utils_exports, {
  crossProduct: () => crossProduct,
  getStateType: () => getStateType,
  summarizeStateDefinition: () => summarizeStateDefinition
});
module.exports = __toCommonJS(utils_exports);
const crossProduct = (as, bs) => {
  const result = [];
  for (const a of as) {
    for (const b of bs) {
      result.push([a, b]);
    }
  }
  return result;
};
const getStateType = (state, fallback) => {
  var _a, _b;
  return Array.isArray(state.type) ? state.type[0] : (_b = (_a = state.type) != null ? _a : fallback) != null ? _b : "string";
};
const summarizeStateDefinition = (sd) => {
  return `${sd.device.name}:${sd.state.name} (Type=${sd.commonType})`;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  crossProduct,
  getStateType,
  summarizeStateDefinition
});
//# sourceMappingURL=utils.js.map
