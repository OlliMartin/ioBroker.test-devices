"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var device_metadata_exports = {};
__export(device_metadata_exports, {
  deviceTypeBlacklist: () => deviceTypeBlacklist,
  getDeviceMetadata: () => getDeviceMetadata,
  getDeviceNamesMissingDefaultRoles: () => getDeviceNamesMissingDefaultRoles
});
module.exports = __toCommonJS(device_metadata_exports);
var import_type_detector = __toESM(require("@iobroker/type-detector"));
const deviceTypeBlacklist = ["chart"];
const getDeviceNamesMissingDefaultRoles = (allDevices, logCb) => {
  const devicesWithMissingDefaultRoles = allDevices.filter(
    (d) => d.states.filter((s) => s.required && !s.defaultRole).length > 0
  );
  const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map((d) => d.name);
  if (devicesWithMissingDefaultRoles.length > 0) {
    logCb(
      `Found ${devicesWithMissingDefaultRoles.length} devices with missing default roles: [${deviceNamesWithMissingDefaultRoles.join(
        ", "
      )}] These will be skipped.`
    );
  }
  return deviceNamesWithMissingDefaultRoles;
};
const getDeviceMetadata = (logCb) => {
  const knownPatterns = import_type_detector.default.getPatterns();
  const allDevices = Object.entries(knownPatterns).filter(([k, _]) => !deviceTypeBlacklist.includes(k)).map(([k, v]) => ({
    ...v,
    states: v.states.filter((s) => !!s.defaultRole),
    name: k
  }));
  const deviceNamesWithMissingDefaultRoles = getDeviceNamesMissingDefaultRoles(allDevices, logCb);
  return allDevices.filter((d) => !deviceNamesWithMissingDefaultRoles.includes(d.name));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deviceTypeBlacklist,
  getDeviceMetadata,
  getDeviceNamesMissingDefaultRoles
});
//# sourceMappingURL=device-metadata.js.map
