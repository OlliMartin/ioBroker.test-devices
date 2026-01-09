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
const detector = new import_type_detector.default();
const deviceTypeBlacklist = ["chart"];
const getDeviceMetadata = () => {
  const knownPatterns = import_type_detector.default.getPatterns();
  return Object.entries(knownPatterns).filter(([k, _]) => !deviceTypeBlacklist.includes(k)).map(([k, v]) => ({
    ...v,
    states: v.states.filter((s) => !!s.defaultRole),
    name: k
  }));
};
const getStateType = (state, fallback) => {
  var _a, _b;
  return Array.isArray(state.type) ? state.type[0] : (_b = (_a = state.type) != null ? _a : fallback) != null ? _b : "string";
};
const printMissingDefaultRoleMarkdown = (states) => {
  const sortedStates = [...states].sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.deviceRef.name.localeCompare(b.deviceRef.name));
  let output = "| Device | Name | Type | Role Regex |\n";
  output += "| - | - | - | - |\n";
  for (const state of sortedStates) {
    output += `| ${state.deviceRef.name} | ${state.name} | ${getStateType(state, "N/A")} | \`${state.role}\` |
`;
  }
  console.log(output);
};
class TestDevices extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "test-devices"
    });
    this.on("message", this.onMessage.bind(this));
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  static deviceFolderName = "devices";
  static triggerFolderName = "triggers";
  stateNames = [];
  static GetDeviceFolderName() {
    return TestDevices.deviceFolderName;
  }
  static GetTriggerFolderName() {
    return TestDevices.triggerFolderName;
  }
  async onReady() {
    const startMs = Date.now();
    const allDevices = getDeviceMetadata();
    this.analyzeAllStates(allDevices);
    const deviceNamesWithMissingDefaultRoles = this.getDeviceNamesMissingDefaultRoles(allDevices);
    this.analyzeDuplicateDefaultRoles(allDevices);
    const validDevices = allDevices.filter(
      (d) => !deviceNamesWithMissingDefaultRoles.includes(d.name)
    );
    await this.createTopLevelFoldersAsync();
    await this.createAllDevicesAsync(validDevices);
    await this.createDeviceChangeTriggersAsync(validDevices);
    this.log.info(`Stored state count: ${this.stateNames.length}.`);
    this.setConnected(true);
    this.log.info(`Start-up finished within ${Date.now() - startMs}ms.`);
  }
  validCommands = ["VERIFY_DEVICE_TYPE", "GET_DEVICE_STATES"];
  async onMessage(message) {
    if (!this.validCommands.includes(message.command) || !message.callback) {
      this.log.info(`Dropping unknown command '${message.command}'.`);
      this.sendTo(message.from, message.command, "INVALID_COMMAND", message.callback);
      return;
    }
    if (message.command === "VERIFY_DEVICE_TYPE") {
      const deviceType = message.message;
      this.log.debug(`Verifying device type match for ${deviceType}.`);
      const result = await this.verifyCreatedDeviceAsync(deviceType);
      this.sendTo(message.from, message.command, result ? "SUCCESS" : "FAIL", message.callback);
    } else if (message.command === "GET_DEVICE_STATES") {
      this.log.debug("Collecting device states.");
      this.sendTo(message.from, message.command, this.stateNames, message.callback);
    }
  }
  async createTopLevelFoldersAsync() {
    const fqFolderName = `${this.namespace}.${TestDevices.GetDeviceFolderName()}`;
    const fqTriggerName = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;
    await Promise.allSettled([
      this.extendObject(fqTriggerName, {
        type: "folder",
        common: {
          name: fqTriggerName
        }
      }),
      this.extendObject(fqFolderName, {
        type: "folder",
        common: {
          name: fqFolderName
        }
      })
    ]);
  }
  async createAllDevicesAsync(validDevices) {
    this.log.info(`Creating states for ${validDevices.length} devices`);
    let createdStates = 0;
    const startMs = Date.now();
    for (const device of validDevices) {
      createdStates += await this.createOrUpdateSingleDeviceAsync(
        device,
        TestDevices.GetDeviceFolderName(),
        "required",
        (s) => !!s.required
      );
      createdStates += await this.createOrUpdateSingleDeviceAsync(
        device,
        TestDevices.GetDeviceFolderName(),
        "all",
        (_) => true
      );
    }
    this.log.info(
      `Done. Created ${createdStates} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`
    );
  }
  trackCreatedState(fqStateName) {
    this.stateNames.push(fqStateName);
  }
  async createOrUpdateSingleDeviceAsync(device, folderName, prefix, stateFilter) {
    const deviceType = `${this.namespace}.${folderName}.${prefix}`;
    await this.extendObject(deviceType, {
      type: "device",
      common: {
        name: device.name
      }
    });
    const deviceRoot = `${deviceType}.${device.name}`;
    await this.extendObject(deviceRoot, {
      type: "channel",
      common: {
        name: device.name
      }
    });
    const mapStateToJob = (s) => {
      return {
        ...s,
        fqStateName: `${deviceRoot}.${s.name}`,
        commonType: getStateType(s)
      };
    };
    const allPromises = device.states.filter(stateFilter).map(mapStateToJob).map(
      (state) => {
        var _a, _b;
        return this.extendObject(state.fqStateName, {
          type: "state",
          common: {
            name: state.name,
            type: state.commonType,
            read: (_a = state.read) != null ? _a : true,
            write: (_b = state.write) != null ? _b : false,
            role: state.defaultRole,
            unit: state.defaultUnit
          }
        });
      }
    );
    const created = await Promise.all(allPromises);
    created.forEach(({ id }) => this.trackCreatedState(id));
    return allPromises.length;
  }
  async createDeviceChangeTriggersAsync(validDevices) {
    this.log.info(`Creating triggers for ${validDevices.length} devices`);
    const startMs = Date.now();
    const triggerFolder = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;
    for (const generationType of ["required", "all"]) {
      await this.extendObject(`${triggerFolder}.${generationType}`, {
        type: "folder",
        common: {
          name: generationType
        }
      });
    }
    for (const device of validDevices) {
      await this.createOrUpdateSingleDeviceTriggerAsync(device, TestDevices.GetTriggerFolderName(), "required");
      await this.createOrUpdateSingleDeviceTriggerAsync(device, TestDevices.GetTriggerFolderName(), "all");
    }
    this.log.info(`Done. Created ${validDevices.length} device triggers in ${Date.now() - startMs}ms.`);
  }
  async createOrUpdateSingleDeviceTriggerAsync(device, folderName, prefix) {
    const deviceType = `${this.namespace}.${folderName}.${prefix}.${device.name}`;
    await this.extendObject(deviceType, {
      type: "state",
      common: {
        name: device.name,
        type: "boolean",
        role: "button",
        read: false,
        write: true
      }
    });
  }
  objectsLastRead = null;
  objectCache = null;
  async getObjectsCachedAsync() {
    if (this.objectCache && this.objectsLastRead && Date.now() - this.objectsLastRead < 60 * 1e3) {
      return this.objectCache;
    }
    this.objectsLastRead = Date.now();
    this.objectCache = await this.getForeignObjects(`${this.namespace}.${TestDevices.GetDeviceFolderName()}.*`);
    this.log.debug(
      `Read ${Object.keys(this.objectCache).length} objects in ${Date.now() - this.objectsLastRead}ms.`
    );
    return this.objectCache;
  }
  async verifyCreatedDeviceAsync(deviceType) {
    const objects = await this.getObjectsCachedAsync();
    const deviceGenerationTypes = ["all", "required"];
    let result = true;
    for (const generationType of deviceGenerationTypes) {
      const prefix = `${this.namespace}.${TestDevices.GetDeviceFolderName()}.${generationType}`;
      const expectedId = `${prefix}.${deviceType}`;
      const options = {
        objects,
        id: expectedId
      };
      const controls = detector.detect(options);
      if (!controls) {
        this.log.debug(`No matches found for ${options.id}`);
        result = false;
      } else if (controls && controls.length > 1) {
        const foundDeviceTypes = controls.map((c) => c.type).join(", ");
        if (foundDeviceTypes.includes(deviceType)) {
          continue;
        }
        this.log.debug(
          `Too many matches found for ${options.id}, but none of them matches expected type '${deviceType}': [${foundDeviceTypes}]`
        );
        result = false;
      }
    }
    return result;
  }
  onUnload(callback) {
    try {
      this.setConnected(false);
    } catch (error) {
      this.log.error(`Error during unloading: ${error.message}`);
    } finally {
      callback();
    }
  }
  analyzeAllStates(allDevices) {
    const mapState = (device, state) => ({ ...state, deviceRef: device });
    const allStates = allDevices.reduce(
      (prev, curr) => [...prev, ...curr.states.map((s) => mapState(curr, s))],
      []
    );
    this.log.info(`State count total: ${allStates.length}`);
    const statesWithoutDefaultRole = allStates.filter((s) => !s.defaultRole);
    if (statesWithoutDefaultRole.length > 0) {
      this.log.info(
        `States without default role: ${statesWithoutDefaultRole.length} - [${statesWithoutDefaultRole.map((s) => s.name).join(", ")}]`
      );
      printMissingDefaultRoleMarkdown(statesWithoutDefaultRole);
    }
  }
  analyzeDuplicateDefaultRoles(allDevices) {
    const isDuplicatedDefaultRole = (state, allStates) => {
      return allStates.filter((sInner) => sInner.defaultRole == state.defaultRole).length > 1;
    };
    const devicesWithDuplicateDefaultRoles = allDevices.filter(
      (d) => d.states.filter((s) => isDuplicatedDefaultRole(s, d.states)).length > 0
    );
    if (devicesWithDuplicateDefaultRoles.length > 0) {
      const deviceNamesWithDuplicateDefaultRoles = devicesWithDuplicateDefaultRoles.map((d) => d.name);
      this.log.info(
        `Found ${devicesWithDuplicateDefaultRoles.length} devices with duplicate default roles: [${deviceNamesWithDuplicateDefaultRoles.join(
          ", "
        )}] A state will be generated for each, ignoring the duplication.`
      );
      for (const device of devicesWithDuplicateDefaultRoles) {
        const duplicatedDefaultRoles = device.states.filter((s) => isDuplicatedDefaultRole(s, device.states)).map((s) => `${s.name} -> ${s.defaultRole}`);
        this.log.info(`	${device.name} -> Duplicate Roles: ${duplicatedDefaultRoles.join(", ")}`);
      }
    }
  }
  getDeviceNamesMissingDefaultRoles(allDevices) {
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
    return deviceNamesWithMissingDefaultRoles;
  }
  setConnected(isConnected) {
    void this.setState(
      "info.connection",
      isConnected,
      true,
      (error) => (
        // analyse if the state could be set (because of permissions)
        error ? this.log.error(`Can not update this._connected state: ${error}`) : this.log.debug(`connected set to ${isConnected}`)
      )
    );
  }
}
if (require.main !== module) {
  module.exports = (options) => new TestDevices(options);
} else {
  (() => new TestDevices())();
}
//# sourceMappingURL=main.js.map
