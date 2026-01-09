"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_type_detector = __toESM(require("@iobroker/type-detector"));
class TestDevices extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "test-devices"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.config.test.unknown = [];
  }
  async onReady() {
    const knownPatterns = import_type_detector.default.getPatterns();
    const allDevices = Object.entries(knownPatterns).map(([k, v]) => ({
      ...v,
      name: k
    }));
    console.log(
      "State count total:",
      allDevices.map((d) => d.states).reduce((prev, curr) => [...prev, ...curr], []).length
    );
    const devicesWithMissingDefaultRoles = allDevices.filter(
      (d) => d.states.filter((s) => s.required && !s.defaultRole).length > 0
    );
    const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map((d) => d.name);
    if (devicesWithMissingDefaultRoles.length > 0) {
      this.log.warn(
        `Found ${devicesWithMissingDefaultRoles.length} devices with missing default roles: [${deviceNamesWithMissingDefaultRoles.join(
          ", "
        )}] These will be skipped.`
      );
    }
    const validDevices = allDevices.filter(
      (d) => !deviceNamesWithMissingDefaultRoles.includes(d.name)
    );
    this.log.info(`Creating states for ${validDevices.length} devices`);
    let createdStates = 0;
    const startMs = Date.now();
    for (const device of validDevices) {
      createdStates += await this.createOrUpdateSingleDeviceAsync(device);
    }
    this.log.info(
      `Done. Created ${createdStates} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`
    );
  }
  async createOrUpdateSingleDeviceAsync(device) {
    var _a, _b, _c;
    const deviceRoot = `${this.namespace}.${device.name}`;
    await this.extendObject(deviceRoot, {
      type: "channel",
      common: {
        name: device.name
      }
    });
    let createdStates = 0;
    for (const state of device.states.filter((s) => s.required)) {
      const stateName = `${deviceRoot}.${state.name}`;
      const type = Array.isArray(state.type) ? state.type[0] : (_a = state.type) != null ? _a : "string";
      await this.extendObject(stateName, {
        type: "state",
        common: {
          name: state.name,
          type,
          read: (_b = state.read) != null ? _b : true,
          write: (_c = state.write) != null ? _c : false,
          role: state.defaultRole,
          unit: state.defaultUnit
        }
      });
      createdStates++;
    }
    return createdStates;
  }
  onUnload(callback) {
    try {
    } catch (error) {
      this.log.error(`Error during unloading: ${error.message}`);
    } finally {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new TestDevices(options);
} else {
  (() => new TestDevices())();
}
//# sourceMappingURL=main.js.map
