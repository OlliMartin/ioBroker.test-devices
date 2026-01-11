
# Important

Note: This file should not be updated manually. It is auto-generated and to be consumed by AI (agents).
For brevity, the list omits all `boolean` states.

The following table lists the state mappings defined in [value-generator.defs.ts](../src/value-generator.defs.ts), 
inside the constant `commonValueGenerators`.

All states originate from the ioBroker.type-detector module [here](https://github.com/ioBroker/ioBroker.type-detector/blob/master/src/typePatterns.ts).
Refer to the [README.md](../README.md) for more information about this adapter.

The value generators follow this structure in their typescript definition:

```
{
	u: "<The unit of the state, if present>"
	t: "<The type of the state in ioBroker>"
	d: ["<The name of the devices as defined in type-detector>"]
	s: ["<The name of the states as defined in type-detector>"]
	gen: <The generator function for the next state. This is implicitly set through WRAPPERS>
	description: "<A description of how the values are generated>"
}
```

There are a few wrappers available:
- `NumberRange($min, $max, $decimalPlaces)` - Generates the next number randomly in the provided range. In a description this wrapper has the form: Num[$min..$max#P$decimalPlaces]
- `RandomNumber` - This wrapper indicates that a state is not yet properly handled and should be changed
- `Toggle` - This is the default value generator for `boolean` states. It toggles the value 

# State Mappings

| Device | State Name | Role | Unit | Value Type | Remark/Description |
| ------ | ---------- | ---- | ---- | ---------- | ------------------ |
| airCondition | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| airCondition | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| airCondition | CURRENT | value.current | mA | number | Num[100..2000#P0] |
| airCondition | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| airCondition | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| airCondition | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| airCondition | HUMIDITY | value.humidity | % | number | Num[0..100#P2] |
| airCondition | MODE | level.mode.airconditioner |  | number | Num[0..4#P0] |
| airCondition | MODE | level.mode.airconditioner |  | number | Num[0..4#P0] |
| airCondition | SET | level.temperature | °C | number | Num[-5..35#P1] |
| airCondition | SET | level.temperature | °C | number | Num[-5..35#P1] |
| airCondition | SPEED | level.mode.fan |  | number | Num[1..100#P0] |
| airCondition | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| blindButtons | BATTERY | value.battery | % | number | Num[0..100#P2] |
| blindButtons | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| blindButtons | TILT_ACTUAL | value.tilt |  | number | Tilt angle in degrees (0=closed, 90=fully open) |
| blindButtons | TILT_SET | level.tilt |  | number | Tilt angle in degrees (0=closed, 90=fully open) |
| blindButtons | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| blinds | ACTUAL | value.blind | % | number | Num[0..100#P2] |
| blinds | BATTERY | value.battery | % | number | Num[0..100#P2] |
| blinds | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| blinds | SET | level.blind | % | number | Num[0..100#P2] |
| blinds | SET | level.blind | % | number | Num[0..100#P2] |
| blinds | TILT_ACTUAL | value.tilt |  | number | Tilt angle in degrees (0=closed, 90=fully open) |
| blinds | TILT_SET | level.tilt |  | number | Tilt angle in degrees (0=closed, 90=fully open) |
| blinds | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| button | BATTERY | value.battery | % | number | Num[0..100#P2] |
| button | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| buttonSensor | BATTERY | value.battery | % | number | Num[0..100#P2] |
| buttonSensor | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| camera | BATTERY | value.battery | % | number | Num[0..100#P2] |
| camera | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| camera | PTZ | level.camera.position |  | number | Pan/Tilt/Zoom position |
| camera | URL | link.camera |  | string | Camera stream URL |
| camera | URL | link.camera |  | string | Camera stream URL |
| cie | BATTERY | value.battery | % | number | Num[0..100#P2] |
| cie | CIE | level.color.cie |  | string | CIE 1931 color space coordinates (x,y) |
| cie | CIE | level.color.cie |  | string | CIE 1931 color space coordinates (x,y) |
| cie | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| cie | CURRENT | value.current | mA | number | Num[100..500#P0] |
| cie | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| cie | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| cie | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| cie | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| cie | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| cie | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| cie | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| cie | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| ct | BATTERY | value.battery | % | number | Num[0..100#P2] |
| ct | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| ct | CURRENT | value.current | mA | number | Num[100..500#P0] |
| ct | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| ct | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| ct | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| ct | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| ct | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| ct | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| ct | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| ct | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| ct | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| dimmer | ACTUAL | value.dimmer | % | number | Num[0..100#P2] |
| dimmer | BATTERY | value.battery | % | number | Num[0..100#P2] |
| dimmer | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| dimmer | CURRENT | value.current | mA | number | Num[100..500#P0] |
| dimmer | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| dimmer | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| dimmer | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| dimmer | SET | level.dimmer | % | number | Num[0..100#P2] |
| dimmer | SET | level.dimmer | % | number | Num[0..100#P2] |
| dimmer | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| dimmer | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| dimmer | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| door | BATTERY | value.battery | % | number | Num[0..100#P2] |
| door | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| fireAlarm | BATTERY | value.battery | % | number | Num[0..100#P2] |
| fireAlarm | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| floodAlarm | BATTERY | value.battery | % | number | Num[0..100#P2] |
| floodAlarm | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| gate | ACTUAL | value.blind | % | number | Num[0..100#P2] |
| gate | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| gate | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| hue | BATTERY | value.battery | % | number | Num[0..100#P2] |
| hue | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| hue | CURRENT | value.current | mA | number | Num[100..500#P0] |
| hue | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| hue | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| hue | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| hue | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| hue | HUE | level.color.hue | ° | number | Num[0..359#P1] |
| hue | HUE | level.color.hue | ° | number | Num[0..359#P1] |
| hue | SATURATION | level.color.saturation | % | number | Num[0..100#P2] |
| hue | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| hue | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| hue | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| hue | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| humidity | ACTUAL | value.humidity | % | number | Num[0..100#P2] |
| humidity | ACTUAL | value.humidity | % | number | Num[0..100#P2] |
| humidity | BATTERY | value.battery | % | number | Num[0..100#P2] |
| humidity | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| illuminance | ACTUAL | value.brightness | lux | number | Num[0..100000#P0] |
| illuminance | ACTUAL | value.brightness | lux | number | Num[0..100000#P0] |
| illuminance | BATTERY | value.battery | % | number | Num[0..100#P2] |
| illuminance | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| image | BATTERY | value.battery | % | number | Num[0..100#P2] |
| image | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| image | URL | icon |  | string | Image URL |
| image | URL | icon |  | string | Image URL |
| info | ACTUAL | state |  | string | Device state information |
| info | ACTUAL | state |  | string | Device state information |
| info | BATTERY | value.battery | % | number | Num[0..100#P2] |
| info | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| info | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| levelSlider | ACTUAL | value | % | number | Num[0..100#P2] |
| levelSlider | BATTERY | value.battery | % | number | Num[0..100#P2] |
| levelSlider | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| levelSlider | SET | level | % | number | Num[0..100#P2] |
| levelSlider | SET | level | % | number | Num[0..100#P2] |
| levelSlider | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| light | BATTERY | value.battery | % | number | Num[0..100#P2] |
| light | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| light | CURRENT | value.current | mA | number | Num[100..500#P0] |
| light | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| light | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| light | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| light | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| light | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| location | ACCURACY | value.gps.accuracy |  | number | Num[1..50#P0] |
| location | BATTERY | value.battery | % | number | Num[0..100#P2] |
| location | ELEVATION | value.gps.elevation |  | number | Num[-100..4000#P0] |
| location | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| location | LATITUDE | value.gps.latitude | ° | number | Num[-90..90#P5] |
| location | LATITUDE | value.gps.latitude | ° | number | Num[-90..90#P5] |
| location | LONGITUDE | value.gps.longitude | ° | number | Num[-180..180#P5] |
| location | LONGITUDE | value.gps.longitude | ° | number | Num[-180..180#P5] |
| location | RADIUS | value.gps.radius |  | number | GPS accuracy radius in meters |
| locationOne | ACCURACY | value.gps.accuracy |  | number | Num[1..50#P0] |
| locationOne | BATTERY | value.battery | % | number | Num[0..100#P2] |
| locationOne | ELEVATION | value.gps.elevation |  | number | Num[-100..4000#P0] |
| locationOne | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| locationOne | GPS | value.gps |  | string | GPS coordinates (latitude,longitude) |
| locationOne | GPS | value.gps |  | string | GPS coordinates (latitude,longitude) |
| locationOne | RADIUS | value.gps.radius |  | number | GPS accuracy radius in meters |
| lock | BATTERY | value.battery | % | number | Num[0..100#P2] |
| lock | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| lock | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| mediaPlayer | ALBUM | media.album |  | string |  |
| mediaPlayer | ARTIST | media.artist |  | string |  |
| mediaPlayer | BATTERY | value.battery | % | number | Num[0..100#P2] |
| mediaPlayer | COVER | media.cover |  | string | Album/media cover art URL |
| mediaPlayer | DURATION | media.duration | sec | number | Num[0..300#P0] |
| mediaPlayer | ELAPSED | media.elapsed | sec | number | Num[0..300#P0] |
| mediaPlayer | EPISODE | media.episode |  | string |  |
| mediaPlayer | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| mediaPlayer | REPEAT | media.mode.repeat |  | number | Repeat mode (0=off, 1=repeat all, 2=repeat one) |
| mediaPlayer | SEASON | media.season |  | string |  |
| mediaPlayer | SEEK | media.seek |  | number | Seek position in seconds |
| mediaPlayer | TITLE | media.title |  | string |  |
| mediaPlayer | TRACK | media.track |  | string |  |
| mediaPlayer | VOLUME | level.volume | % | number | Num[0..100#P2] |
| mediaPlayer | VOLUME_ACTUAL | value.volume | % | number | Num[0..100#P2] |
| motion | BATTERY | value.battery | % | number | Num[0..100#P2] |
| motion | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| motion | SECOND | value.brightness | lux | number | Num[0..100000#P0] |
| percentage | ACTUAL | value | % | number | Num[0..100#P2] |
| percentage | BATTERY | value.battery | % | number | Num[0..100#P2] |
| percentage | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| percentage | SET | level | % | number | Num[0..100#P2] |
| percentage | SET | level | % | number | Num[0..100#P2] |
| percentage | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgb | BATTERY | value.battery | % | number | Num[0..100#P2] |
| rgb | BLUE | level.color.blue |  | number | Num[0..255#P0] |
| rgb | BLUE | level.color.blue |  | number | Num[0..255#P0] |
| rgb | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| rgb | CURRENT | value.current | mA | number | Num[100..500#P0] |
| rgb | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| rgb | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| rgb | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgb | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| rgb | GREEN | level.color.green |  | number | Num[0..255#P0] |
| rgb | GREEN | level.color.green |  | number | Num[0..255#P0] |
| rgb | RED | level.color.red |  | number | Num[0..255#P0] |
| rgb | RED | level.color.red |  | number | Num[0..255#P0] |
| rgb | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| rgb | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| rgb | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| rgb | WHITE | level.color.white |  | number | Num[0..255#P0] |
| rgb | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgbSingle | BATTERY | value.battery | % | number | Num[0..100#P2] |
| rgbSingle | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| rgbSingle | CURRENT | value.current | mA | number | Num[100..500#P0] |
| rgbSingle | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| rgbSingle | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| rgbSingle | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgbSingle | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| rgbSingle | RGB | level.color.rgb |  | string | RGB color in hex format (#RRGGBB) |
| rgbSingle | RGB | level.color.rgb |  | string | RGB color in hex format (#RRGGBB) |
| rgbSingle | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| rgbSingle | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| rgbSingle | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| rgbSingle | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgbwSingle | BATTERY | value.battery | % | number | Num[0..100#P2] |
| rgbwSingle | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| rgbwSingle | CURRENT | value.current | mA | number | Num[100..500#P0] |
| rgbwSingle | DIMMER | level.dimmer | % | number | Num[0..100#P2] |
| rgbwSingle | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| rgbwSingle | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgbwSingle | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| rgbwSingle | RGBW | level.color.rgbw |  | string | RGBW color in hex format (#RRGGBBWW) |
| rgbwSingle | RGBW | level.color.rgbw |  | string | RGBW color in hex format (#RRGGBBWW) |
| rgbwSingle | TEMPERATURE | level.color.temperature | °K | number | Num[2000..6500#P0] |
| rgbwSingle | TRANSITION_TIME | time.span | ms | number | Num[0..10000#P0] |
| rgbwSingle | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| rgbwSingle | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| socket | CONSUMPTION | value.power.consumption | Wh | number | Num[20..500#P0] |
| socket | CURRENT | value.current | mA | number | Num[100..500#P0] |
| socket | ELECTRIC_POWER | value.power | W | number | Num[20..500#P0] |
| socket | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| socket | FREQUENCY | value.frequency | Hz | number | Num[5000..15000#P0] |
| socket | VOLTAGE | value.voltage | V | number | Num[80..150#P1] |
| socket | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| temperature | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| temperature | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| temperature | BATTERY | value.battery | % | number | Num[0..100#P2] |
| temperature | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| temperature | SECOND | value.humidity | % | number | Num[0..100#P2] |
| thermostat | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| thermostat | BATTERY | value.battery | % | number | Num[0..100#P2] |
| thermostat | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| thermostat | HUMIDITY | value.humidity | % | number | Num[0..100#P2] |
| thermostat | MODE | level.mode.thermostat |  | number | Thermostat mode (0=off, 1=heat, 2=cool, 3=auto) |
| thermostat | SET | level.temperature | °C | number | Num[-5..35#P1] |
| thermostat | SET | level.temperature | °C | number | Num[-5..35#P1] |
| thermostat | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| vacuumCleaner | BRUSH | value.usage.brush | % | number | Num[0..100#P2] |
| vacuumCleaner | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| vacuumCleaner | FILTER | value.usage.filter | % | number | Num[0..100#P2] |
| vacuumCleaner | MAP_BASE64 | vacuum.map.base64 |  | string | Vacuum cleaner map as base64 encoded image |
| vacuumCleaner | MODE | level.mode.cleanup |  | number | Num[0..3#P0] |
| vacuumCleaner | MODE | level.mode.cleanup |  | number | Num[0..3#P0] |
| vacuumCleaner | SENSORS | value.usage.sensors | % | number | Num[0..100#P2] |
| vacuumCleaner | SIDE_BRUSH | value.usage.brush.side | % | number | Num[0..100#P2] |
| vacuumCleaner | STATE | value.state |  | number | Num[0..5#P0] (0=idle,1=docked,2=error,3=cleaning,4=paused,5=returning) |
| vacuumCleaner | WASTE | value.waste | % | number | Num[0..100#P2] |
| vacuumCleaner | WATER | value.water | % | number | Num[0..100#P2] |
| vacuumCleaner | WORK_MODE | level.mode.work |  | number | Work mode (0=auto, 1=spot, 2=edge, 3=room) |
| volume | ACTUAL | value.volume | % | number | Num[0..100#P2] |
| volume | BATTERY | value.battery | % | number | Num[0..100#P2] |
| volume | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| volume | SET | level.volume | % | number | Num[0..100#P2] |
| volume | SET | level.volume | % | number | Num[0..100#P2] |
| volume | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| volumeGroup | ACTUAL | value.volume.group | % | number | Num[0..100#P2] |
| volumeGroup | BATTERY | value.battery | % | number | Num[0..100#P2] |
| volumeGroup | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| volumeGroup | SET | level.volume.group | % | number | Num[0..100#P2] |
| volumeGroup | SET | level.volume.group | % | number | Num[0..100#P2] |
| volumeGroup | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| warning | DESC | weather.state |  | string | Weather warning description |
| warning | END | date.end |  | string | Warning start/end time (ISO 8601) |
| warning | ICON | weather.chart.url |  | string | Weather icon URL |
| warning | INFO | weather.title |  | string | Warning title/info |
| warning | LEVEL | value.warning |  | string | Warning severity level |
| warning | LEVEL | value.warning |  | string | Warning severity level |
| warning | START | date.start |  | string | Warning start/end time (ISO 8601) |
| warning | TITLE | weather.title.short |  | string | Warning title/info |
| weatherCurrent | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| weatherCurrent | ACTUAL | value.temperature | °C | number | Num[-5..35#P1] |
| weatherCurrent | BATTERY | value.battery | % | number | Num[0..100#P2] |
| weatherCurrent | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| weatherCurrent | HUMIDITY | value.humidity | % | number | Num[0..100#P2] |
| weatherCurrent | ICON | weather.icon |  | string | Weather icon URL |
| weatherCurrent | ICON | weather.icon |  | string | Weather icon URL |
| weatherCurrent | PRECIPITATION_CHANCE | value.precipitation.chance | % | number | Num[0..100#P2] |
| weatherCurrent | PRECIPITATION_TYPE | value.precipitation.type |  | number | Precipitation type (0=none, 1=rain, 2=snow, 3=sleet, 4=hail) |
| weatherCurrent | PRESSURE | value.pressure | mbar | number | Num[950..1050#P1] |
| weatherCurrent | PRESSURE_TENDENCY | value.pressure.tendency |  | string | Barometric pressure tendency |
| weatherCurrent | REAL_FEEL_TEMPERATURE | value.temperature.windchill | °C | number | Num[-5..35#P1] |
| weatherCurrent | UV | value.uv |  | number | Num[0..11#P0] |
| weatherCurrent | WEATHER | weather.state |  | string | Weather state description |
| weatherCurrent | WIND_DIRECTION | value.direction.wind | ° | string | Num[0..359#P1] [TYPE ADJUSTED] |
| weatherCurrent | WIND_GUST | value.speed.wind.gust | km/h | number | Num[5..20#P2] |
| weatherCurrent | WIND_SPEED | value.speed.wind$ | km/h | number | Num[5..20#P2] |
| weatherForecast | DATE | date.forecast.0 |  | string | Forecast date (YYYY-MM-DD) |
| weatherForecast | DOW | dayofweek.forecast.0 |  | string | Day of week |
| weatherForecast | FEELS_LIKE | value.temperature.feelslike.forecast.0 |  | number | Feels like temperature in °C |
| weatherForecast | FORECAST_CHART | weather.chart.url.forecast |  | string | Weather chart URL |
| weatherForecast | HISTORY_CHART | weather.chart.url |  | string | Weather chart URL |
| weatherForecast | HUMIDITY | value.humidity.forecast.0 |  | number | Forecast humidity % |
| weatherForecast | ICON | weather.icon.forecast.0 |  | string | Weather icon URL |
| weatherForecast | ICON | weather.icon.forecast.0 |  | string | Weather icon URL |
| weatherForecast | LOCATION | location |  | string | Location name |
| weatherForecast | PRECIPITATION | value.precipitation.forecast.0 |  | number | Precipitation amount (mm) or chance (%) |
| weatherForecast | PRECIPITATION_CHANCE | value.precipitation.forecast.0 |  | number | Precipitation amount (mm) or chance (%) |
| weatherForecast | PRESSURE | value.pressure.forecast.0 |  | number | Forecast pressure in mbar |
| weatherForecast | STATE | weather.state.forecast.0 |  | string | Weather state description |
| weatherForecast | TEMP | value.temperature.forecast.0 |  | number | Forecast temperature in °C |
| weatherForecast | TEMP_MAX | value.temperature.max.forecast.0 |  | number | Forecast temperature in °C |
| weatherForecast | TEMP_MAX | value.temperature.max.forecast.0 |  | number | Forecast temperature in °C |
| weatherForecast | TEMP_MIN | value.temperature.min.forecast.0 |  | number | Forecast temperature in °C |
| weatherForecast | TEMP_MIN | value.temperature.min.forecast.0 |  | number | Forecast temperature in °C |
| weatherForecast | TIME_SUNRISE | date.sunrise |  | string | Sunrise/sunset time (ISO 8601) |
| weatherForecast | TIME_SUNSET | date.sunset |  | string | Sunrise/sunset time (ISO 8601) |
| weatherForecast | WIND_CHILL | value.temperature.windchill.forecast.0 |  | number | Wind chill temperature in °C |
| weatherForecast | WIND_DIRECTION | value.direction.wind.forecast.0 |  | number | Wind direction in degrees |
| weatherForecast | WIND_DIRECTION_STR | weather.direction.wind.forecast.0 |  | string | Wind direction (N, NE, E, SE, S, SW, W, NW) |
| weatherForecast | WIND_ICON | weather.icon.wind.forecast.0 |  | string | Wind direction icon URL |
| weatherForecast | WIND_SPEED | value.speed.wind.forecast.0 |  | number | Wind speed in km/h |
| window | BATTERY | value.battery | % | number | Num[0..100#P2] |
| window | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| windowTilt | ACTUAL | value.window |  | number | Window state (0=closed, 1=tilted, 2=open) |
| windowTilt | ACTUAL | value.window |  | number | Window state (0=closed, 1=tilted, 2=open) |
| windowTilt | BATTERY | value.battery | % | number | Num[0..100#P2] |
| windowTilt | ERROR | indicator.error |  | string | 'YES' or 'NO' |
