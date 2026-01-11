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
var value_generator_defs_exports = {};
__export(value_generator_defs_exports, {
  commonValueGenerators: () => commonValueGenerators,
  fallbackValueGenerators: () => fallbackValueGenerators
});
module.exports = __toCommonJS(value_generator_defs_exports);
var import_constants = require("./constants");
var import_value_generators = require("./value-generators");
const fallbackValueGenerators = [
  { u: import_constants.UNIT__TYPE_MATCH, t: "number", ...(0, import_value_generators.RandomNumber)(), isFallback: true },
  {
    u: import_constants.UNIT__TYPE_MATCH,
    t: "string",
    gen: (0, import_value_generators.adjustType)((0, import_value_generators.getFallbackValueGenerator)(), (v) => {
      var _a;
      return (_a = v == null ? void 0 : v.toString()) != null ? _a : "N/A";
    }),
    isFallback: true
  },
  {
    u: import_constants.UNIT__TYPE_MATCH,
    t: "boolean",
    ...(0, import_value_generators.Toggle)(),
    isFallback: false
  }
];
const commonValueGenerators = [
  { u: "%", t: "number", ...(0, import_value_generators.NumberRange)(0, 100, 2) },
  { u: "Hz", t: "number", ...(0, import_value_generators.NumberRange)(5e3, 15e3, 0) },
  { u: "V", t: "number", ...(0, import_value_generators.NumberRange)(80, 150, 1) },
  { u: "W", t: "number", ...(0, import_value_generators.NumberRange)(20, 500, 0) },
  { u: "Wh", t: "number", ...(0, import_value_generators.NumberRange)(20, 500, 0) },
  { u: "km/h", t: "number", ...(0, import_value_generators.NumberRange)(5, 20, 2) },
  { u: "lux", t: "number", ...(0, import_value_generators.NumberRange)(0, 1e5, 0) },
  { u: "mA", t: "number", ...(0, import_value_generators.NumberRange)(100, 500, 0) },
  { u: "mbar", t: "number", ...(0, import_value_generators.NumberRange)(950, 1050, 1) },
  { u: "sec", t: "number", ...(0, import_value_generators.NumberRange)(0, 300, 0) },
  { u: "\xB0", t: "number", ...(0, import_value_generators.NumberRange)(0, 359, 1) },
  { u: "\xB0", t: "string", ...(0, import_value_generators.AdjustType)((0, import_value_generators.NumberRange)(0, 359, 1), (num) => num.toFixed(2)) },
  { u: "\xB0C", t: "number", ...(0, import_value_generators.NumberRange)(-5, 35, 1) },
  { u: "\xB0K", t: "number", ...(0, import_value_generators.NumberRange)(2e3, 6500, 0) },
  /* Longitude & Latitude */
  { u: "\xB0", t: "number", d: ["location"], s: ["LONGITUDE"], ...(0, import_value_generators.NumberRange)(-180, 180, 5) },
  { u: "\xB0", t: "number", d: ["location"], s: ["LATITUDE"], ...(0, import_value_generators.NumberRange)(-90, 90, 5) },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["RED", "GREEN", "BLUE", "WHITE"],
    ...(0, import_value_generators.NumberRange)(0, 255, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["rgb", "rgbwSingle"],
    s: ["TEMPERATURE"],
    ...(0, import_value_generators.NumberRange)(0, 1e3, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    s: ["WORKING", "ERROR"],
    gen: (sd, _) => sd.state.name === "WORKING" ? "YES" : "NO",
    description: "'YES' or 'NO'"
  },
  // Proposals for TODO states - add to commonValueGenerators array
  // Air Conditioner states
  {
    u: "mA",
    t: "number",
    d: ["airCondition"],
    s: ["CURRENT"],
    // The AI thought it's important the air conditioner can draw more current. ¯\_(ツ)_/¯
    ...(0, import_value_generators.NumberRange)(100, 2e3, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["airCondition"],
    s: ["MODE"],
    ...(0, import_value_generators.NumberRange)(0, 4, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["airCondition"],
    s: ["SPEED"],
    ...(0, import_value_generators.NumberRange)(1, 100, 0)
  },
  {
    u: "lux",
    t: "number",
    d: ["illuminance"],
    s: ["ACTUAL"],
    ...(0, import_value_generators.NumberRange)(0, 1e5, 0)
  },
  // GPS/Location states
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["location", "locationOne"],
    s: ["ACCURACY"],
    ...(0, import_value_generators.NumberRange)(1, 50, 0)
  },
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["location", "locationOne"],
    s: ["ELEVATION"],
    ...(0, import_value_generators.NumberRange)(-100, 4e3, 0)
  },
  { u: import_constants.UNIT__CUSTOM, t: "number", d: ["weatherCurrent"], s: ["UV"], ...(0, import_value_generators.NumberRange)(0, 11, 0) },
  // Vacuum cleaner states
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["vacuumCleaner"],
    s: ["STATE"],
    ...(0, import_value_generators.NumberRange)(0, 5, 0),
    description: "Num[0..5#P0] (0=idle,1=docked,2=error,3=cleaning,4=paused,5=returning)"
  },
  { u: import_constants.UNIT__CUSTOM, t: "number", d: ["vacuumCleaner"], s: ["MODE"], ...(0, import_value_generators.NumberRange)(0, 3, 0) },
  // Transition times (all devices)
  {
    u: "ms",
    t: "number",
    s: ["TRANSITION_TIME"],
    ...(0, import_value_generators.NumberRange)(0, 1e4, 0)
  },
  // Media strings (generate simple random media content)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["mediaPlayer"],
    s: ["ALBUM", "ARTIST", "TITLE", "TRACK", "EPISODE", "SEASON"],
    gen: () => ["Track 1", "Artist X", "Album Y", "Season 1", "Episode 5"][Math.floor(Math.random() * 5)]
  },
  // Tilt values (blinds, blindButtons) - typically 0-90 degrees for venetian blinds
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["blinds", "blindButtons"],
    s: ["TILT_ACTUAL", "TILT_SET"],
    ...(0, import_value_generators.NumberRange)(0, 90, 0),
    description: "Tilt angle in degrees (0=closed, 90=fully open)"
  },
  // Camera PTZ (Pan-Tilt-Zoom) - normalized value 0-1 or degrees
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["camera"],
    s: ["PTZ"],
    ...(0, import_value_generators.NumberRange)(0, 360, 0),
    description: "Pan/Tilt/Zoom position"
  },
  // Camera URL - generate placeholder RTSP/HTTP stream URLs
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["camera"],
    s: ["URL"],
    gen: () => `rtsp://192.168.1.${Math.floor(Math.random() * 254 + 1)}:554/stream`,
    description: "Camera stream URL"
  },
  // CIE color coordinates (x,y format, each 0-1)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["cie"],
    s: ["CIE"],
    gen: () => {
      const x = (Math.random() * 0.7 + 0.15).toFixed(4);
      const y = (Math.random() * 0.7 + 0.15).toFixed(4);
      return `${x},${y}`;
    },
    description: "CIE 1931 color space coordinates (x,y)"
  },
  // Image URL - generate placeholder image URLs
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["image"],
    s: ["URL"],
    gen: () => `https://placekitten.com/${200 + Math.floor(Math.random() * 400)}/${200 + Math.floor(Math.random() * 400)}`,
    description: "Image URL"
  },
  // Info state - general status string
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["info"],
    s: ["ACTUAL"],
    gen: () => ["OK", "READY", "STANDBY", "ACTIVE", "IDLE"][Math.floor(Math.random() * 5)],
    description: "Device state information"
  },
  // GPS coordinates as combined string (latitude,longitude)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["locationOne"],
    s: ["GPS"],
    gen: () => {
      const lat = (Math.random() * 180 - 90).toFixed(5);
      const lon = (Math.random() * 360 - 180).toFixed(5);
      return `${lat},${lon}`;
    },
    description: "GPS coordinates (latitude,longitude)"
  },
  // GPS radius - accuracy radius in meters
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["location", "locationOne"],
    s: ["RADIUS"],
    ...(0, import_value_generators.NumberRange)(5, 100, 0),
    description: "GPS accuracy radius in meters"
  },
  // Media player cover art URL
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["mediaPlayer"],
    s: ["COVER"],
    gen: () => `https://via.placeholder.com/300x300/random/${Math.floor(Math.random() * 1e3)}.jpg`,
    description: "Album/media cover art URL"
  },
  // Media player repeat mode (0=off, 1=all, 2=one)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["mediaPlayer"],
    s: ["REPEAT"],
    ...(0, import_value_generators.NumberRange)(0, 2, 0),
    description: "Repeat mode (0=off, 1=repeat all, 2=repeat one)"
  },
  // Media player seek position in seconds
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["mediaPlayer"],
    s: ["SEEK"],
    ...(0, import_value_generators.NumberRange)(0, 300, 0),
    description: "Seek position in seconds"
  },
  // RGB color as hex string (#RRGGBB)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["rgbSingle"],
    s: ["RGB"],
    gen: () => {
      const r = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const g = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const b = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    },
    description: "RGB color in hex format (#RRGGBB)"
  },
  // RGBW color as hex string (#RRGGBBWW)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["rgbwSingle"],
    s: ["RGBW"],
    gen: () => {
      const r = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const g = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const b = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const w = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      return `#${r}${g}${b}${w}`;
    },
    description: "RGBW color in hex format (#RRGGBBWW)"
  },
  // Thermostat mode (0=off, 1=heat, 2=cool, 3=auto)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["thermostat"],
    s: ["MODE"],
    ...(0, import_value_generators.NumberRange)(0, 3, 0),
    description: "Thermostat mode (0=off, 1=heat, 2=cool, 3=auto)"
  },
  // Vacuum cleaner map as base64 encoded image
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["vacuumCleaner"],
    s: ["MAP_BASE64"],
    gen: () => {
      return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    },
    description: "Vacuum cleaner map as base64 encoded image"
  },
  // Vacuum cleaner work mode (0=auto, 1=spot, 2=edge, 3=room)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["vacuumCleaner"],
    s: ["WORK_MODE"],
    ...(0, import_value_generators.NumberRange)(0, 3, 0),
    description: "Work mode (0=auto, 1=spot, 2=edge, 3=room)"
  },
  // Weather warning description
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["warning"],
    s: ["DESC"],
    gen: () => [
      "Clear skies",
      "Partly cloudy",
      "Overcast",
      "Light rain expected",
      "Thunderstorms possible",
      "Strong winds"
    ][Math.floor(Math.random() * 6)],
    description: "Weather warning description"
  },
  // Weather warning start/end dates (ISO format)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["warning"],
    s: ["START", "END"],
    gen: (sd) => {
      const now = /* @__PURE__ */ new Date();
      if (sd.state.name === "START") {
        return now.toISOString();
      }
      now.setHours(now.getHours() + Math.floor(Math.random() * 24) + 1);
      return now.toISOString();
    },
    description: "Warning start/end time (ISO 8601)"
  },
  // Weather icon URL
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["warning", "weatherCurrent", "weatherForecast"],
    s: ["ICON"],
    gen: () => {
      const icons = ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"];
      return `https://openweathermap.org/img/wn/${icons[Math.floor(Math.random() * icons.length)]}@2x.png`;
    },
    description: "Weather icon URL"
  },
  // Weather warning info/title
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["warning"],
    s: ["INFO", "TITLE"],
    gen: () => ["Weather Alert", "Storm Warning", "Wind Advisory", "Heat Warning", "Frost Warning"][Math.floor(Math.random() * 5)],
    description: "Warning title/info"
  },
  // Weather warning level
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["warning"],
    s: ["LEVEL"],
    gen: () => ["LOW", "MODERATE", "HIGH", "SEVERE"][Math.floor(Math.random() * 4)],
    description: "Warning severity level"
  },
  // Weather precipitation type (0=none, 1=rain, 2=snow, 3=sleet, 4=hail)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherCurrent"],
    s: ["PRECIPITATION_TYPE"],
    ...(0, import_value_generators.NumberRange)(0, 4, 0),
    description: "Precipitation type (0=none, 1=rain, 2=snow, 3=sleet, 4=hail)"
  },
  // Pressure tendency (rising, falling, steady)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherCurrent"],
    s: ["PRESSURE_TENDENCY"],
    gen: () => ["rising", "falling", "steady"][Math.floor(Math.random() * 3)],
    description: "Barometric pressure tendency"
  },
  // Weather state description
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherCurrent", "weatherForecast"],
    s: ["WEATHER", "STATE"],
    gen: () => ["Clear", "Cloudy", "Rainy", "Stormy", "Snowy", "Foggy", "Windy"][Math.floor(Math.random() * 7)],
    description: "Weather state description"
  },
  // Weather forecast date (ISO date string)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["DATE"],
    gen: () => {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 7));
      return date.toISOString().split("T")[0];
    },
    description: "Forecast date (YYYY-MM-DD)"
  },
  // Day of week for forecast
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["DOW"],
    gen: () => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][Math.floor(Math.random() * 7)],
    description: "Day of week"
  },
  // Feels like temperature
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["FEELS_LIKE"],
    ...(0, import_value_generators.NumberRange)(-5, 35, 1),
    description: "Feels like temperature in \xB0C"
  },
  // Weather chart URLs
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["FORECAST_CHART", "HISTORY_CHART"],
    gen: () => `https://example.com/weather/chart_${Math.floor(Math.random() * 1e3)}.png`,
    description: "Weather chart URL"
  },
  // Humidity forecast
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["HUMIDITY"],
    ...(0, import_value_generators.NumberRange)(0, 100, 0),
    description: "Forecast humidity %"
  },
  // Location name
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["LOCATION"],
    gen: () => ["New York", "London", "Tokyo", "Paris", "Berlin", "Sydney"][Math.floor(Math.random() * 6)],
    description: "Location name"
  },
  // Precipitation amount
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["PRECIPITATION", "PRECIPITATION_CHANCE"],
    ...(0, import_value_generators.NumberRange)(0, 50, 1),
    description: "Precipitation amount (mm) or chance (%)"
  },
  // Forecast pressure
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["PRESSURE"],
    ...(0, import_value_generators.NumberRange)(950, 1050, 1),
    description: "Forecast pressure in mbar"
  },
  // Forecast temperature
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["TEMP", "TEMP_MAX", "TEMP_MIN"],
    ...(0, import_value_generators.NumberRange)(-5, 35, 1),
    description: "Forecast temperature in \xB0C"
  },
  // Sunrise/sunset times (ISO time string)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["TIME_SUNRISE", "TIME_SUNSET"],
    gen: (sd) => {
      const hours = sd.state.name === "TIME_SUNRISE" ? 6 + Math.floor(Math.random() * 2) : 18 + Math.floor(Math.random() * 2);
      const minutes = Math.floor(Math.random() * 60);
      const date = /* @__PURE__ */ new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    },
    description: "Sunrise/sunset time (ISO 8601)"
  },
  // Wind chill temperature
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["WIND_CHILL"],
    ...(0, import_value_generators.NumberRange)(-10, 30, 1),
    description: "Wind chill temperature in \xB0C"
  },
  // Wind direction (degrees)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["WIND_DIRECTION"],
    ...(0, import_value_generators.NumberRange)(0, 359, 0),
    description: "Wind direction in degrees"
  },
  // Wind direction as string (N, NE, E, SE, S, SW, W, NW)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["WIND_DIRECTION_STR"],
    gen: () => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
    description: "Wind direction (N, NE, E, SE, S, SW, W, NW)"
  },
  // Wind icon URL
  {
    u: import_constants.UNIT__CUSTOM,
    t: "string",
    d: ["weatherForecast"],
    s: ["WIND_ICON"],
    gen: () => `https://example.com/wind/icon_${Math.floor(Math.random() * 8)}.png`,
    description: "Wind direction icon URL"
  },
  // Wind speed forecast
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["weatherForecast"],
    s: ["WIND_SPEED"],
    ...(0, import_value_generators.NumberRange)(0, 50, 1),
    description: "Wind speed in km/h"
  },
  // Window tilt state (0=closed, 1=tilted, 2=open)
  {
    u: import_constants.UNIT__CUSTOM,
    t: "number",
    d: ["windowTilt"],
    s: ["ACTUAL"],
    ...(0, import_value_generators.NumberRange)(0, 2, 0),
    description: "Window state (0=closed, 1=tilted, 2=open)"
  },
  ...fallbackValueGenerators
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonValueGenerators,
  fallbackValueGenerators
});
//# sourceMappingURL=value-generator.defs.js.map
