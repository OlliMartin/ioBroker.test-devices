
# Important

Note: This file should not be updated manually. It is auto-generated.
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
- `NumberRange($min, $max, $decimalPlaces)` - Generates the next number randomly in the provided range
- `RandomNumber` - This wrapper indicates that a state is not yet properly handled and should be changed
- `Toggle` - This is the default value generator for `boolean` states. It toggles the value 

# State Mappings

| Device | State Name | Role | Unit | Value Type | Remark/Description |
| ------ | ---------- | ---- | ---- | ---------- | ------------------ |
		| airCondition | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| airCondition | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| airCondition | CURRENT | value.current | mA | number | TODO |
| airCondition | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| airCondition | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| airCondition | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| airCondition | HUMIDITY | value.humidity | % | number | Num[0-100] |
| airCondition | MODE | level.mode.airconditioner |  | number | TODO |
| airCondition | MODE | level.mode.airconditioner |  | number | TODO |
| airCondition | SET | level.temperature | °C | number | Num[-5-35] |
| airCondition | SET | level.temperature | °C | number | Num[-5-35] |
| airCondition | SPEED | level.mode.fan |  | number | TODO |
| airCondition | VOLTAGE | value.voltage | V | number | Num[80-150] |
| blindButtons | BATTERY | value.battery | % | number | Num[0-100] |
| blindButtons | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| blindButtons | TILT_ACTUAL | value.tilt |  | number | TODO |
| blindButtons | TILT_SET | level.tilt |  | number | TODO |
| blindButtons | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| blinds | ACTUAL | value.blind | % | number | Num[0-100] |
| blinds | BATTERY | value.battery | % | number | Num[0-100] |
| blinds | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| blinds | SET | level.blind | % | number | Num[0-100] |
| blinds | SET | level.blind | % | number | Num[0-100] |
| blinds | TILT_ACTUAL | value.tilt |  | number | TODO |
| blinds | TILT_SET | level.tilt |  | number | TODO |
| blinds | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| button | BATTERY | value.battery | % | number | Num[0-100] |
| button | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| buttonSensor | BATTERY | value.battery | % | number | Num[0-100] |
| buttonSensor | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| camera | BATTERY | value.battery | % | number | Num[0-100] |
| camera | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| camera | PTZ | level.camera.position |  | number | TODO |
| camera | URL | link.camera |  | string | TODO |
| camera | URL | link.camera |  | string | TODO |
| cie | BATTERY | value.battery | % | number | Num[0-100] |
| cie | CIE | level.color.cie |  | string | TODO |
| cie | CIE | level.color.cie |  | string | TODO |
| cie | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| cie | CURRENT | value.current | mA | number | TODO |
| cie | DIMMER | level.dimmer | % | number | Num[0-100] |
| cie | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| cie | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| cie | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| cie | TEMPERATURE | level.color.temperature | °K | number | TODO |
| cie | TRANSITION_TIME | time.span | ms | number | TODO |
| cie | VOLTAGE | value.voltage | V | number | Num[80-150] |
| cie | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| ct | BATTERY | value.battery | % | number | Num[0-100] |
| ct | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| ct | CURRENT | value.current | mA | number | TODO |
| ct | DIMMER | level.dimmer | % | number | Num[0-100] |
| ct | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| ct | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| ct | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| ct | TEMPERATURE | level.color.temperature | °K | number | TODO |
| ct | TEMPERATURE | level.color.temperature | °K | number | TODO |
| ct | TRANSITION_TIME | time.span | ms | number | TODO |
| ct | VOLTAGE | value.voltage | V | number | Num[80-150] |
| ct | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| dimmer | ACTUAL | value.dimmer | % | number | Num[0-100] |
| dimmer | BATTERY | value.battery | % | number | Num[0-100] |
| dimmer | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| dimmer | CURRENT | value.current | mA | number | TODO |
| dimmer | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| dimmer | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| dimmer | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| dimmer | SET | level.dimmer | % | number | Num[0-100] |
| dimmer | SET | level.dimmer | % | number | Num[0-100] |
| dimmer | TRANSITION_TIME | time.span | ms | number | TODO |
| dimmer | VOLTAGE | value.voltage | V | number | Num[80-150] |
| dimmer | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| door | BATTERY | value.battery | % | number | Num[0-100] |
| door | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| fireAlarm | BATTERY | value.battery | % | number | Num[0-100] |
| fireAlarm | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| floodAlarm | BATTERY | value.battery | % | number | Num[0-100] |
| floodAlarm | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| gate | ACTUAL | value.blind | % | number | Num[0-100] |
| gate | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| gate | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| hue | BATTERY | value.battery | % | number | Num[0-100] |
| hue | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| hue | CURRENT | value.current | mA | number | TODO |
| hue | DIMMER | level.dimmer | % | number | Num[0-100] |
| hue | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| hue | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| hue | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| hue | HUE | level.color.hue | ° | number | TODO |
| hue | HUE | level.color.hue | ° | number | TODO |
| hue | SATURATION | level.color.saturation | % | number | Num[0-100] |
| hue | TEMPERATURE | level.color.temperature | °K | number | TODO |
| hue | TRANSITION_TIME | time.span | ms | number | TODO |
| hue | VOLTAGE | value.voltage | V | number | Num[80-150] |
| hue | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| humidity | ACTUAL | value.humidity | % | number | Num[0-100] |
| humidity | ACTUAL | value.humidity | % | number | Num[0-100] |
| humidity | BATTERY | value.battery | % | number | Num[0-100] |
| humidity | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| illuminance | ACTUAL | value.brightness | lux | number | TODO |
| illuminance | ACTUAL | value.brightness | lux | number | TODO |
| illuminance | BATTERY | value.battery | % | number | Num[0-100] |
| illuminance | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| image | BATTERY | value.battery | % | number | Num[0-100] |
| image | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| image | URL | icon |  | string | TODO |
| image | URL | icon |  | string | TODO |
| info | ACTUAL | state |  | string | TODO |
| info | ACTUAL | state |  | string | TODO |
| info | BATTERY | value.battery | % | number | Num[0-100] |
| info | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| info | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| levelSlider | ACTUAL | value | % | number | Num[0-100] |
| levelSlider | BATTERY | value.battery | % | number | Num[0-100] |
| levelSlider | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| levelSlider | SET | level | % | number | Num[0-100] |
| levelSlider | SET | level | % | number | Num[0-100] |
| levelSlider | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| light | BATTERY | value.battery | % | number | Num[0-100] |
| light | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| light | CURRENT | value.current | mA | number | TODO |
| light | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| light | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| light | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| light | VOLTAGE | value.voltage | V | number | Num[80-150] |
| light | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| location | ACCURACY | value.gps.accuracy |  | number | TODO |
| location | BATTERY | value.battery | % | number | Num[0-100] |
| location | ELEVATION | value.gps.elevation |  | number | TODO |
| location | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| location | LATITUDE | value.gps.latitude | ° | number | Num[-90-90] |
| location | LATITUDE | value.gps.latitude | ° | number | Num[-90-90] |
| location | LONGITUDE | value.gps.longitude | ° | number | Num[-180-180] |
| location | LONGITUDE | value.gps.longitude | ° | number | Num[-180-180] |
| location | RADIUS | value.gps.radius |  | number | TODO |
| locationOne | ACCURACY | value.gps.accuracy |  | number | TODO |
| locationOne | BATTERY | value.battery | % | number | Num[0-100] |
| locationOne | ELEVATION | value.gps.elevation |  | number | TODO |
| locationOne | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| locationOne | GPS | value.gps |  | string | TODO |
| locationOne | GPS | value.gps |  | string | TODO |
| locationOne | RADIUS | value.gps.radius |  | number | TODO |
| lock | BATTERY | value.battery | % | number | Num[0-100] |
| lock | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| lock | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| mediaPlayer | ALBUM | media.album |  | string | TODO |
| mediaPlayer | ARTIST | media.artist |  | string | TODO |
| mediaPlayer | BATTERY | value.battery | % | number | Num[0-100] |
| mediaPlayer | COVER | media.cover |  | string | TODO |
| mediaPlayer | DURATION | media.duration | sec | number | Num[0-300] |
| mediaPlayer | ELAPSED | media.elapsed | sec | number | Num[0-300] |
| mediaPlayer | EPISODE | media.episode |  | string | TODO |
| mediaPlayer | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| mediaPlayer | REPEAT | media.mode.repeat |  | number | TODO |
| mediaPlayer | SEASON | media.season |  | string | TODO |
| mediaPlayer | SEEK | media.seek |  | number | TODO |
| mediaPlayer | TITLE | media.title |  | string | TODO |
| mediaPlayer | TRACK | media.track |  | string | TODO |
| mediaPlayer | VOLUME | level.volume | % | number | Num[0-100] |
| mediaPlayer | VOLUME_ACTUAL | value.volume | % | number | Num[0-100] |
| motion | BATTERY | value.battery | % | number | Num[0-100] |
| motion | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| motion | SECOND | value.brightness | lux | number | TODO |
| percentage | ACTUAL | value | % | number | Num[0-100] |
| percentage | BATTERY | value.battery | % | number | Num[0-100] |
| percentage | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| percentage | SET | level | % | number | Num[0-100] |
| percentage | SET | level | % | number | Num[0-100] |
| percentage | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgb | BATTERY | value.battery | % | number | Num[0-100] |
| rgb | BLUE | level.color.blue |  | number | Num[0-255] |
| rgb | BLUE | level.color.blue |  | number | Num[0-255] |
| rgb | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| rgb | CURRENT | value.current | mA | number | TODO |
| rgb | DIMMER | level.dimmer | % | number | Num[0-100] |
| rgb | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| rgb | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgb | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| rgb | GREEN | level.color.green |  | number | Num[0-255] |
| rgb | GREEN | level.color.green |  | number | Num[0-255] |
| rgb | RED | level.color.red |  | number | Num[0-255] |
| rgb | RED | level.color.red |  | number | Num[0-255] |
| rgb | TEMPERATURE | level.color.temperature | °K | number | Num[0-1000] |
| rgb | TRANSITION_TIME | time.span | ms | number | TODO |
| rgb | VOLTAGE | value.voltage | V | number | Num[80-150] |
| rgb | WHITE | level.color.white |  | number | Num[0-255] |
| rgb | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgbSingle | BATTERY | value.battery | % | number | Num[0-100] |
| rgbSingle | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| rgbSingle | CURRENT | value.current | mA | number | TODO |
| rgbSingle | DIMMER | level.dimmer | % | number | Num[0-100] |
| rgbSingle | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| rgbSingle | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgbSingle | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| rgbSingle | RGB | level.color.rgb |  | string | TODO |
| rgbSingle | RGB | level.color.rgb |  | string | TODO |
| rgbSingle | TEMPERATURE | level.color.temperature | °K | number | TODO |
| rgbSingle | TRANSITION_TIME | time.span | ms | number | TODO |
| rgbSingle | VOLTAGE | value.voltage | V | number | Num[80-150] |
| rgbSingle | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| rgbwSingle | BATTERY | value.battery | % | number | Num[0-100] |
| rgbwSingle | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| rgbwSingle | CURRENT | value.current | mA | number | TODO |
| rgbwSingle | DIMMER | level.dimmer | % | number | Num[0-100] |
| rgbwSingle | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| rgbwSingle | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| rgbwSingle | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| rgbwSingle | RGBW | level.color.rgbw |  | string | TODO |
| rgbwSingle | RGBW | level.color.rgbw |  | string | TODO |
| rgbwSingle | TEMPERATURE | level.color.temperature | °K | number | Num[0-1000] |
| rgbwSingle | TRANSITION_TIME | time.span | ms | number | TODO |
| rgbwSingle | VOLTAGE | value.voltage | V | number | Num[80-150] |
| rgbwSingle | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| socket | CONSUMPTION | value.power.consumption | Wh | number | Num[20-500] |
| socket | CURRENT | value.current | mA | number | TODO |
| socket | ELECTRIC_POWER | value.power | W | number | Num[20-500] |
| socket | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| socket | FREQUENCY | value.frequency | Hz | number | Num[5000-15000] |
| socket | VOLTAGE | value.voltage | V | number | Num[80-150] |
| socket | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| temperature | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| temperature | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| temperature | BATTERY | value.battery | % | number | Num[0-100] |
| temperature | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| temperature | SECOND | value.humidity | % | number | Num[0-100] |
| thermostat | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| thermostat | BATTERY | value.battery | % | number | Num[0-100] |
| thermostat | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| thermostat | HUMIDITY | value.humidity | % | number | Num[0-100] |
| thermostat | MODE | level.mode.thermostat |  | number | TODO |
| thermostat | SET | level.temperature | °C | number | Num[-5-35] |
| thermostat | SET | level.temperature | °C | number | Num[-5-35] |
| thermostat | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| vacuumCleaner | BRUSH | value.usage.brush | % | number | Num[0-100] |
| vacuumCleaner | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| vacuumCleaner | FILTER | value.usage.filter | % | number | Num[0-100] |
| vacuumCleaner | MAP_BASE64 | vacuum.map.base64 |  | string | TODO |
| vacuumCleaner | MODE | level.mode.cleanup |  | number | TODO |
| vacuumCleaner | MODE | level.mode.cleanup |  | number | TODO |
| vacuumCleaner | SENSORS | value.usage.sensors | % | number | Num[0-100] |
| vacuumCleaner | SIDE_BRUSH | value.usage.brush.side | % | number | Num[0-100] |
| vacuumCleaner | STATE | value.state |  | number | TODO |
| vacuumCleaner | WASTE | value.waste | % | number | Num[0-100] |
| vacuumCleaner | WATER | value.water | % | number | Num[0-100] |
| vacuumCleaner | WORK_MODE | level.mode.work |  | number | TODO |
| volume | ACTUAL | value.volume | % | number | Num[0-100] |
| volume | BATTERY | value.battery | % | number | Num[0-100] |
| volume | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| volume | SET | level.volume | % | number | Num[0-100] |
| volume | SET | level.volume | % | number | Num[0-100] |
| volume | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| volumeGroup | ACTUAL | value.volume.group | % | number | Num[0-100] |
| volumeGroup | BATTERY | value.battery | % | number | Num[0-100] |
| volumeGroup | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| volumeGroup | SET | level.volume.group | % | number | Num[0-100] |
| volumeGroup | SET | level.volume.group | % | number | Num[0-100] |
| volumeGroup | WORKING | indicator.working |  | string | 'YES' or 'NO' |
| warning | DESC | weather.state |  | string | TODO |
| warning | END | date.end |  | string | TODO |
| warning | ICON | weather.chart.url |  | string | TODO |
| warning | INFO | weather.title |  | string | TODO |
| warning | LEVEL | value.warning |  | string | TODO |
| warning | LEVEL | value.warning |  | string | TODO |
| warning | START | date.start |  | string | TODO |
| warning | TITLE | weather.title.short |  | string | TODO |
| weatherCurrent | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| weatherCurrent | ACTUAL | value.temperature | °C | number | Num[-5-35] |
| weatherCurrent | BATTERY | value.battery | % | number | Num[0-100] |
| weatherCurrent | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| weatherCurrent | HUMIDITY | value.humidity | % | number | Num[0-100] |
| weatherCurrent | ICON | weather.icon |  | string | TODO |
| weatherCurrent | ICON | weather.icon |  | string | TODO |
| weatherCurrent | PRECIPITATION_CHANCE | value.precipitation.chance | % | number | Num[0-100] |
| weatherCurrent | PRECIPITATION_TYPE | value.precipitation.type |  | number | TODO |
| weatherCurrent | PRESSURE | value.pressure | mbar | number | TODO |
| weatherCurrent | PRESSURE_TENDENCY | value.pressure.tendency |  | string | TODO |
| weatherCurrent | REAL_FEEL_TEMPERATURE | value.temperature.windchill | °C | number | Num[-5-35] |
| weatherCurrent | UV | value.uv |  | number | TODO |
| weatherCurrent | WEATHER | weather.state |  | string | TODO |
| weatherCurrent | WIND_DIRECTION | value.direction.wind | ° | string | TODO [TYPE ADJUSTED] |
| weatherCurrent | WIND_GUST | value.speed.wind.gust | km/h | number | Num[5-20] |
| weatherCurrent | WIND_SPEED | value.speed.wind$ | km/h | number | Num[5-20] |
| weatherForecast | DATE | date.forecast.0 |  | string | TODO |
| weatherForecast | DOW | dayofweek.forecast.0 |  | string | TODO |
| weatherForecast | FEELS_LIKE | value.temperature.feelslike.forecast.0 |  | number | TODO |
| weatherForecast | FORECAST_CHART | weather.chart.url.forecast |  | string | TODO |
| weatherForecast | HISTORY_CHART | weather.chart.url |  | string | TODO |
| weatherForecast | HUMIDITY | value.humidity.forecast.0 |  | number | TODO |
| weatherForecast | ICON | weather.icon.forecast.0 |  | string | TODO |
| weatherForecast | ICON | weather.icon.forecast.0 |  | string | TODO |
| weatherForecast | LOCATION | location |  | string | TODO |
| weatherForecast | PRECIPITATION | value.precipitation.forecast.0 |  | number | TODO |
| weatherForecast | PRECIPITATION_CHANCE | value.precipitation.forecast.0 |  | number | TODO |
| weatherForecast | PRESSURE | value.pressure.forecast.0 |  | number | TODO |
| weatherForecast | STATE | weather.state.forecast.0 |  | string | TODO |
| weatherForecast | TEMP | value.temperature.forecast.0 |  | number | TODO |
| weatherForecast | TEMP_MAX | value.temperature.max.forecast.0 |  | number | TODO |
| weatherForecast | TEMP_MAX | value.temperature.max.forecast.0 |  | number | TODO |
| weatherForecast | TEMP_MIN | value.temperature.min.forecast.0 |  | number | TODO |
| weatherForecast | TEMP_MIN | value.temperature.min.forecast.0 |  | number | TODO |
| weatherForecast | TIME_SUNRISE | date.sunrise |  | string | TODO |
| weatherForecast | TIME_SUNSET | date.sunset |  | string | TODO |
| weatherForecast | WIND_CHILL | value.temperature.windchill.forecast.0 |  | number | TODO |
| weatherForecast | WIND_DIRECTION | value.direction.wind.forecast.0 |  | number | TODO |
| weatherForecast | WIND_DIRECTION_STR | weather.direction.wind.forecast.0 |  | string | TODO |
| weatherForecast | WIND_ICON | weather.icon.wind.forecast.0 |  | string | TODO |
| weatherForecast | WIND_SPEED | value.speed.wind.forecast.0 |  | number | TODO |
| window | BATTERY | value.battery | % | number | Num[0-100] |
| window | ERROR | indicator.error |  | string | 'YES' or 'NO' |
| windowTilt | ACTUAL | value.window |  | number | TODO |
| windowTilt | ACTUAL | value.window |  | number | TODO |
| windowTilt | BATTERY | value.battery | % | number | Num[0-100] |
| windowTilt | ERROR | indicator.error |  | string | 'YES' or 'NO' |
