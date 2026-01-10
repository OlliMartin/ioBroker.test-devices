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
var state_definitions_exports = {};
__export(state_definitions_exports, {
  createDesiredStateDefinitions: () => createDesiredStateDefinitions
});
module.exports = __toCommonJS(state_definitions_exports);
var import_utils = require("./utils");
var import_constants = require("./constants");
var import_value_generator_factory = require("./value-generator-factory");
var import_value_generators = require("./value-generators");
const createDesiredStateDefinitions = (namespace, config, validDevices, trackGeneratorCb) => {
  const getDeviceType = (genType) => `${namespace}.${(0, import_constants.GetDeviceFolderName)()}.${genType}`;
  const getDeviceRoot = (genType, device) => `${getDeviceType(genType)}.${device.name}`;
  const getFilterContext = (device) => {
    return { device, config };
  };
  const isReadOnly = (state) => (!!state.read || state.read === void 0) && !state.write;
  let stateCacheMemory = (0, import_utils.crossProduct)(import_constants.generationTypes, validDevices).map((arr) => ({
    generationType: arr[0],
    device: arr[1]
  })).map((m) => ({
    ...m,
    context: getFilterContext(m.device),
    deviceType: getDeviceType(m.generationType),
    deviceRoot: getDeviceRoot(m.generationType, m.device)
  })).map(
    (m) => m.device.states.filter((s) => import_constants.deviceFilter[m.generationType](m.context, s)).map((s) => {
      var _a, _b;
      return {
        ...m,
        state: s,
        read: (_a = s.read) != null ? _a : true,
        write: (_b = s.write) != null ? _b : false,
        stateFqn: `${m.deviceRoot}.${s.name}`,
        commonType: (0, import_utils.getStateType)(s),
        isReadOnly: isReadOnly(s),
        valueGenerator: void 0
      };
    })
  ).reduce((prev, curr) => [...prev, ...curr], []);
  stateCacheMemory = stateCacheMemory.filter((sd) => stateCacheMemory.filter((sdInner) => sdInner.stateFqn === sd.stateFqn).length === 1).map((sd) => {
    var _a;
    return {
      ...sd,
      valueGenerator: (_a = (0, import_value_generator_factory.getValueGenerator)(sd, trackGeneratorCb)) != null ? _a : (0, import_value_generators.getFallbackValueGenerator)()
    };
  });
  return stateCacheMemory.reduce((prev, curr) => ({ ...prev, [curr.stateFqn]: curr }), {});
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDesiredStateDefinitions
});
//# sourceMappingURL=state-definitions.js.map
