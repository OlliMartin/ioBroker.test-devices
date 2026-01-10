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
var constants_exports = {};
__export(constants_exports, {
  GetDeviceFolderName: () => GetDeviceFolderName,
  GetTriggerFolderName: () => GetTriggerFolderName,
  UNIT__CUSTOM: () => UNIT__CUSTOM,
  UNIT__TYPE_MATCH: () => UNIT__TYPE_MATCH,
  deviceFilter: () => deviceFilter,
  generationTypes: () => generationTypes
});
module.exports = __toCommonJS(constants_exports);
const GetDeviceFolderName = () => {
  return "devices";
};
const GetTriggerFolderName = () => {
  return "triggers";
};
const generationTypes = ["all", "required"];
const deviceFilter = {
  all: (_1, _2) => true,
  required: (_, s) => !!s.required
};
const UNIT__CUSTOM = "%%CUSTOM%%";
const UNIT__TYPE_MATCH = "%%TYPE_MATCH%%";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetDeviceFolderName,
  GetTriggerFolderName,
  UNIT__CUSTOM,
  UNIT__TYPE_MATCH,
  deviceFilter,
  generationTypes
});
//# sourceMappingURL=constants.js.map
