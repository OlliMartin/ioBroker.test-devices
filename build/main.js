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
var import_device_metadata = require("./device-metadata");
var import_utils = require("./utils");
var import_state_definitions = require("./state-definitions");
var import_constants = require("./constants");
var import_value_generators = require("./value-generators");
const detector = new import_type_detector.default();
class TestDevices extends utils.Adapter {
  validDevices;
  stateLookup;
  stateNames = [];
  constructor(options = {}) {
    super({
      ...options,
      name: "test-devices"
    });
    this.on("message", this.onMessage.bind(this));
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
    const startMs = Date.now();
    this.validDevices = (0, import_device_metadata.getDeviceMetadata)(this.logLater);
    this.analyzeAllStates(this.validDevices);
    this.analyzeDuplicateDefaultRoles(this.validDevices);
    this.stateLookup = (0, import_state_definitions.createDesiredStateDefinitions)(this.namespace, this.config, this.validDevices);
    this.stateNames = Object.keys(this.stateLookup);
    this.logLater(`Discovering desired states took ${Date.now() - startMs}ms.`);
    const triggerChangeRegex = `^${this.namespace.replace(".", "\\.")}\\.${(0, import_constants.GetTriggerFolderName)()}\\.((${import_constants.generationTypes.join("|")})\\.([^\\.]*))$`;
    this.logLater(`Constructed trigger change regex: ${triggerChangeRegex}`);
    const deviceChangeRegex = `^${this.namespace}\\.${(0, import_constants.GetDeviceFolderName)()}\\.(${import_constants.generationTypes.join("|")})\\.([^\\.]*)\\.([^\\.]*)$`;
    this.logLater(`Constructed device change regex: ${deviceChangeRegex}`);
    this.triggerChangeRegex = new RegExp(triggerChangeRegex);
    this.deviceStateChangeRegex = new RegExp(deviceChangeRegex);
  }
  async onReady() {
    for (const msg of this.logMessages) {
      this.log.info(msg);
    }
    this.logMessages = [];
    const startMs = Date.now();
    const objectCache = await this.getObjectsCachedAsync();
    await this.createTopLevelFoldersAsync();
    await this.createDeviceChangeTriggersAsync(this.validDevices);
    await this.createMetaStatesForDevicesAsync(this.validDevices);
    const foundInDb = Object.keys(objectCache);
    if (this.stateNames.every((requestedDeviceStateName) => foundInDb.includes(requestedDeviceStateName))) {
      this.log.debug(
        `Device states unchanged from last start. Want: ${this.stateNames.length} Have: ${foundInDb.length}. Skipping creation.`
      );
    } else {
      this.log.debug(
        `Actual device states deviate from desired state. Want: ${this.stateNames.length} Have: ${foundInDb.length}. Recreating all.`
      );
      await this.createAllDevicesAsync(this.validDevices);
      this.objectCache = null;
      void this.getObjectsCachedAsync();
    }
    this.log.info(`Stored state count: ${this.stateNames.length}.`);
    this.subscribeStates(`${this.namespace}.*`);
    if (this.config.acknowledgeStatesOnStart) {
      await this.updateAllStates();
    }
    this.setConnected(true);
    this.log.info(`Start-up finished within ${Date.now() - startMs}ms.`);
  }
  validCommands = [
    "VERIFY_DEVICE_TYPE",
    "GET_DEVICE_STATES",
    "SIMULATE_DEVICE_CHANGES",
    "SIMULATE_SINGLE_DEVICE_CHANGE"
  ];
  triggerChangeRegex;
  deviceStateChangeRegex;
  async onStateChange(id, state) {
    if (!state || state.ack) {
      return;
    }
    if (this.triggerChangeRegex.test(id)) {
      const startMs = Date.now();
      const match = this.triggerChangeRegex.exec(id);
      if (!match || match.length < 4) {
        return;
      }
      const genType = (0, import_utils.parseGenerationType)(match[2]);
      const device = match[3];
      if (!genType) {
        this.log.warn(`Unknown generation type: '${match[2]}'. Refusing to process trigger.`);
        return;
      }
      this.log.debug(`Received trigger for ${id} -> ${genType}:${device}.`);
      await this.simulateSingleDeviceStatesAsync(genType, device);
      await this.setState(id, state, true);
      this.log.debug(`Trigger processed in ${Date.now() - startMs}ms.`);
    }
    if (this.deviceStateChangeRegex.test(id)) {
      this.log.debug(`Received state change for device ${id}.`);
      await this.setState(id, state, true);
    }
  }
  async onMessage(message) {
    if (!this.validCommands.includes(message.command) || !message.callback) {
      this.log.info(`Dropping unknown command '${message.command}'.`);
      this.sendTo(message.from, message.command, "INVALID_COMMAND", message.callback);
      return;
    }
    if (message.command === "VERIFY_DEVICE_TYPE") {
      const deviceType = message.message;
      const result = await this.verifyCreatedDeviceAsync(deviceType);
      this.sendTo(message.from, message.command, result ? "SUCCESS" : "FAIL", message.callback);
    } else if (message.command === "GET_DEVICE_STATES") {
      this.log.debug("Collecting device states.");
      this.sendTo(message.from, message.command, this.stateNames, message.callback);
    } else if (message.command === "SIMULATE_DEVICE_CHANGES") {
      await this.updateAllStates();
      this.sendTo(message.from, message.command, "SUCCESS", message.callback);
    } else if (message.command === "SIMULATE_SINGLE_DEVICE_CHANGE") {
      const generationTypeUntyped = message.message.generationType;
      const deviceName = message.message.device;
      const sendInvalidPayloadResponse = (msg) => this.sendTo(message.from, message.command, `INVALID_PAYLOAD:${msg}`, message.callback);
      if (!generationTypeUntyped || typeof generationTypeUntyped !== "string") {
        sendInvalidPayloadResponse(
          `Expected property 'generationType' to be one of [${import_constants.generationTypes.join(", ")}].`
        );
        return;
      }
      const generationType = (0, import_utils.parseGenerationType)(generationTypeUntyped);
      if (!generationType) {
        sendInvalidPayloadResponse(
          `Expected property 'generationType' to be one of [${import_constants.generationTypes.join(", ")}].`
        );
        return;
      }
      if (!deviceName || typeof deviceName !== "string") {
        sendInvalidPayloadResponse(`Expected property 'device' to be a simple string.`);
        return;
      }
      await this.simulateSingleDeviceStatesAsync(generationType, deviceName);
      this.sendTo(message.from, message.command, "SUCCESS", message.callback);
    }
  }
  async createTopLevelFoldersAsync() {
    const fqFolderName = `${this.namespace}.${(0, import_constants.GetDeviceFolderName)()}`;
    const fqTriggerName = `${this.namespace}.${(0, import_constants.GetTriggerFolderName)()}`;
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
    const startMs = Date.now();
    this.log.debug(`Creating ${this.stateNames.length} states for ${validDevices.length} devices`);
    const sem = new Semaphore(16);
    const allPromises = Object.values(this.stateLookup).map(
      (stateDef) => sem.with(
        () => this.extendObject(stateDef.stateFqn, {
          type: "state",
          common: {
            name: stateDef.state.name,
            type: stateDef.commonType,
            read: stateDef.read,
            write: stateDef.write,
            role: stateDef.state.defaultRole,
            unit: stateDef.state.defaultUnit
          }
        })
      )
    );
    await Promise.all(allPromises);
    this.log.info(
      `Created ${this.stateNames.length} states for ${validDevices.length} devices in ${Date.now() - startMs}ms.`
    );
  }
  async createMetaStatesForDevicesAsync(devices) {
    await Promise.all(
      (0, import_utils.crossProduct)(import_constants.generationTypes, devices).map((d) => this.createMetaStatesForDeviceAsync(d[1], d[0]))
    );
  }
  async createMetaStatesForDeviceAsync(device, prefix) {
    const deviceType = `${this.namespace}.${(0, import_constants.GetDeviceFolderName)()}.${prefix}`;
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
  }
  async createDeviceChangeTriggersAsync(validDevices) {
    this.log.debug(`Creating triggers for ${validDevices.length} devices`);
    const startMs = Date.now();
    const triggerFolder = `${this.namespace}.${(0, import_constants.GetTriggerFolderName)()}`;
    for (const generationType of import_constants.generationTypes) {
      await this.extendObject(`${triggerFolder}.${generationType}`, {
        type: "folder",
        common: {
          name: generationType
        }
      });
    }
    for (const generationType of import_constants.generationTypes) {
      for (const device of validDevices) {
        await this.createOrUpdateSingleDeviceTriggerAsync(device, (0, import_constants.GetTriggerFolderName)(), generationType);
      }
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
    const objResult = await this.getForeignObjects(`${this.namespace}.${(0, import_constants.GetDeviceFolderName)()}.*`);
    this.log.debug(`Read ${Object.keys(objResult).length} objects in ${Date.now() - this.objectsLastRead}ms.`);
    if (Object.keys(objResult).length > 0) {
      this.objectCache = objResult;
    }
    return objResult;
  }
  async updateAllStates() {
    const startMs = Date.now();
    const sem = new Semaphore(16);
    this.log.debug(`Updating value of all states. Expecting ${this.stateNames.length} updates.`);
    const promises = (0, import_utils.crossProduct)(import_constants.generationTypes, this.validDevices).map(
      ([genType, device]) => sem.with(() => this.simulateSingleDeviceStatesAsync(genType, device.name))
    );
    const updateCounts = await Promise.all(promises);
    const totalUpdateCount = updateCounts.reduce((prev, curr) => prev + curr, 0);
    this.log.info(`Updated/Simulated ${totalUpdateCount} states in ${Date.now() - startMs}ms. (Actual Count)`);
  }
  async simulateSingleDeviceStatesAsync(genType, deviceName) {
    const allStates = Object.values(this.stateLookup).filter(
      (sd) => sd.generationType === genType && sd.device.name === deviceName
    );
    const relevantStates = allStates.filter((sd) => this.config.updateWriteableStates || sd.isReadOnly);
    const handleSingleState = async (sd) => {
      var _a;
      this.log.silly(`Processing state ${sd.stateFqn}.`);
      const currentValue = await this.getStateAsync(sd.stateFqn);
      const valueGen = (_a = sd.valueGenerator) != null ? _a : (0, import_value_generators.getFallbackValueGenerator)();
      const nextValue = valueGen(sd, currentValue == null ? void 0 : currentValue.val);
      await this.setState(sd.stateFqn, { val: nextValue, ack: true });
    };
    await Promise.all(relevantStates.map(handleSingleState));
    return relevantStates.length;
  }
  async verifyCreatedDeviceAsync(deviceType) {
    const objects = await this.getObjectsCachedAsync();
    const deviceGenerationTypes = ["all", "required"];
    let result = true;
    for (const generationType of deviceGenerationTypes) {
      const prefix = `${this.namespace}.${(0, import_constants.GetDeviceFolderName)()}.${generationType}`;
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
      this.log.error(`Unexpected error during unloading: ${error.message}`);
    } finally {
      callback();
    }
  }
  logMessages = [];
  logLater(message) {
    this.logMessages.push(message);
  }
  analyzeAllStates(allDevices) {
    const mapState = (device, state) => ({ ...state, deviceRef: device });
    const allStates = allDevices.reduce(
      (prev, curr) => [...prev, ...curr.states.map((s) => mapState(curr, s))],
      []
    );
    this.logLater(`State count total: ${allStates.length}`);
    const statesWithoutDefaultRole = allStates.filter((s) => !s.defaultRole);
    if (statesWithoutDefaultRole.length > 0) {
      this.logLater(
        `States without default role: ${statesWithoutDefaultRole.length} - [${statesWithoutDefaultRole.map((s) => s.name).join(", ")}]`
      );
      (0, import_utils.printMissingDefaultRoleMarkdown)(statesWithoutDefaultRole);
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
      this.logLater(
        `Found ${devicesWithDuplicateDefaultRoles.length} devices with duplicate default roles: [${deviceNamesWithDuplicateDefaultRoles.join(
          ", "
        )}] A state will be generated for each, ignoring the duplication.`
      );
      for (const device of devicesWithDuplicateDefaultRoles) {
        const duplicatedDefaultRoles = device.states.filter((s) => isDuplicatedDefaultRole(s, device.states)).map((s) => `${s.name} -> ${s.defaultRole}`);
        this.logLater(`	${device.name} -> Duplicate Roles: ${duplicatedDefaultRoles.join(", ")}`);
      }
    }
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
class Semaphore {
  count;
  queue = [];
  constructor(maxConcurrency) {
    this.count = maxConcurrency;
  }
  async acquire() {
    if (this.count > 0) {
      this.count--;
      return;
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }
  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.count++;
    }
  }
  // Convenience method
  async with(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new TestDevices(options);
} else {
  (() => new TestDevices())();
}
//# sourceMappingURL=main.js.map
