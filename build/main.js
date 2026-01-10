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
var main_exports = {};
__export(main_exports, {
  createDesiredStateDefinitions: () => createDesiredStateDefinitions,
  getDeviceMetadata: () => getDeviceMetadata
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_type_detector = __toESM(require("@iobroker/type-detector"));
const generationTypes = ["all", "required"];
const deviceFilter = {
  all: (_1, _2) => true,
  required: (_, s) => !!s.required
};
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
const crossProduct = (as, bs) => {
  const result = [];
  for (const a of as) {
    for (const b of bs) {
      result.push([a, b]);
    }
  }
  return result;
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
  const exactGeneratorMatches = commonValueGenerators.filter(
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
  const customMatches = commonValueGenerators.filter(
    (vgDef) => vgDef.u === "%%CUSTOM%%" && vgDef.t === stateDefinition.commonType && (vgDef.d === void 0 || vgDef.d.includes(stateDefinition.device.name)) && (vgDef.s === void 0 || vgDef.s.includes(stateDefinition.state.name))
  );
  if (customMatches.length === 1) {
    logFallback(stateDefinition, customMatches[0]);
    return customMatches[0].gen;
  }
  const typeMatches = commonValueGenerators.filter(
    (vgDef) => vgDef.u === "%%TYPE_MATCH%%" && vgDef.t === stateDefinition.commonType
  );
  if (typeMatches.length === 1) {
    logFallback(stateDefinition, typeMatches[0]);
    return typeMatches[0].gen;
  }
  return void 0;
};
const createDesiredStateDefinitions = (namespace, config, validDevices) => {
  const getDeviceType = (genType) => `${namespace}.${TestDevices.GetDeviceFolderName()}.${genType}`;
  const getDeviceRoot = (genType, device) => `${getDeviceType(genType)}.${device.name}`;
  const getFilterContext = (device) => {
    return { device, config };
  };
  const isReadOnly = (state) => (!!state.read || state.read === void 0) && !state.write;
  const stateCacheMemory = crossProduct(generationTypes, validDevices).map((arr) => ({
    generationType: arr[0],
    device: arr[1]
  })).map((m) => ({
    ...m,
    context: getFilterContext(m.device),
    deviceType: getDeviceType(m.generationType),
    deviceRoot: getDeviceRoot(m.generationType, m.device)
  })).map(
    (m) => m.device.states.filter((s) => deviceFilter[m.generationType](m.context, s)).map((s) => {
      var _a, _b;
      return {
        ...m,
        state: s,
        read: (_a = s.read) != null ? _a : true,
        write: (_b = s.write) != null ? _b : false,
        stateFqn: `${m.deviceRoot}.${s.name}`,
        commonType: getStateType(s),
        isReadOnly: isReadOnly(s),
        valueGenerator: void 0
      };
    })
  ).reduce((prev, curr) => [...prev, ...curr], []).map((sd) => {
    var _a;
    return {
      ...sd,
      valueGenerator: (_a = getValueGenerator(sd)) != null ? _a : getFallbackValueGenerator()
    };
  });
  return stateCacheMemory.reduce((prev, curr) => ({ ...prev, [curr.stateFqn]: curr }), {});
};
class TestDevices extends utils.Adapter {
  static deviceFolderName = "devices";
  static triggerFolderName = "triggers";
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
    const allDevices = getDeviceMetadata();
    this.analyzeAllStates(allDevices);
    const deviceNamesWithMissingDefaultRoles = this.getDeviceNamesMissingDefaultRoles(allDevices);
    this.analyzeDuplicateDefaultRoles(allDevices);
    this.validDevices = allDevices.filter((d) => !deviceNamesWithMissingDefaultRoles.includes(d.name));
    this.stateLookup = createDesiredStateDefinitions(this.namespace, this.config, this.validDevices);
    this.stateNames = Object.keys(this.stateLookup);
    this.logLater(`Discovering desired states took ${Date.now() - startMs}ms.`);
    const triggerChangeRegex = `^${this.namespace.replace(".", "\\.")}\\.${TestDevices.GetTriggerFolderName()}\\.((${generationTypes.join("|")})\\.([^\\.]*))$`;
    this.logLater(`Constructed trigger change regex: ${triggerChangeRegex}`);
    const deviceChangeRegex = `^${this.namespace}\\.${TestDevices.GetDeviceFolderName()}\\.(${generationTypes.join("|")})\\.([^\\.]*)\\.([^\\.]*)$`;
    this.logLater(`Constructed device change regex: ${deviceChangeRegex}`);
    this.triggerChangeRegex = new RegExp(triggerChangeRegex);
    this.deviceStateChangeRegex = new RegExp(deviceChangeRegex);
  }
  static GetDeviceFolderName() {
    return TestDevices.deviceFolderName;
  }
  static GetTriggerFolderName() {
    return TestDevices.triggerFolderName;
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
    this.setConnected(true);
    this.log.info(`Start-up finished within ${Date.now() - startMs}ms.`);
    this.subscribeStates(`${this.namespace}.*`);
  }
  validCommands = ["VERIFY_DEVICE_TYPE", "GET_DEVICE_STATES"];
  triggerChangeRegex;
  deviceStateChangeRegex;
  setReadOnlyStatesOnly = false;
  // TODO OMA 2026-01-10: Read from config?
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
      const genType = match[2];
      const device = match[3];
      const allStates = Object.values(this.stateLookup).filter(
        (sd) => sd.generationType === genType && sd.device.name === device
      );
      const relevantStates = allStates.filter((sd) => !this.setReadOnlyStatesOnly || sd.isReadOnly);
      this.log.debug(
        `Received trigger for ${id} -> ${genType}:${device}. ${relevantStates.length} out of ${allStates.length} are relevant (read only).`
      );
      const handleSingleState = async (sd) => {
        var _a;
        const currentValue = await this.getStateAsync(sd.stateFqn);
        const valueGen = (_a = sd.valueGenerator) != null ? _a : getFallbackValueGenerator();
        const nextValue = valueGen(sd, currentValue == null ? void 0 : currentValue.val);
        await this.setState(sd.stateFqn, { val: nextValue, ack: true });
      };
      await Promise.all(relevantStates.map(handleSingleState));
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
    } else if (message.command === "SIMULATE_SINGLE_DEVICE_CHANGE") {
      this.log.debug("Collecting device states.");
    } else if (message.command === "SIMULATE_DEVICE_CHANGES") {
      this.log.debug("Collecting device states.");
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
      crossProduct(generationTypes, devices).map((d) => this.createMetaStatesForDeviceAsync(d[1], d[0]))
    );
  }
  async createMetaStatesForDeviceAsync(device, prefix) {
    const deviceType = `${this.namespace}.${TestDevices.GetDeviceFolderName()}.${prefix}`;
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
    const triggerFolder = `${this.namespace}.${TestDevices.GetTriggerFolderName()}`;
    for (const generationType of generationTypes) {
      await this.extendObject(`${triggerFolder}.${generationType}`, {
        type: "folder",
        common: {
          name: generationType
        }
      });
    }
    for (const generationType of generationTypes) {
      for (const device of validDevices) {
        await this.createOrUpdateSingleDeviceTriggerAsync(
          device,
          TestDevices.GetTriggerFolderName(),
          generationType
        );
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
    const objResult = await this.getForeignObjects(`${this.namespace}.${TestDevices.GetDeviceFolderName()}.*`);
    this.log.debug(`Read ${Object.keys(objResult).length} objects in ${Date.now() - this.objectsLastRead}ms.`);
    if (Object.keys(objResult).length > 0) {
      this.objectCache = objResult;
    }
    return objResult;
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
  getDeviceNamesMissingDefaultRoles(allDevices) {
    const devicesWithMissingDefaultRoles = allDevices.filter(
      (d) => d.states.filter((s) => s.required && !s.defaultRole).length > 0
    );
    const deviceNamesWithMissingDefaultRoles = devicesWithMissingDefaultRoles.map((d) => d.name);
    if (devicesWithMissingDefaultRoles.length > 0) {
      this.logLater(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDesiredStateDefinitions,
  getDeviceMetadata
});
//# sourceMappingURL=main.js.map
