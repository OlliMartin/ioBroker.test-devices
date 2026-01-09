# ioBroker.test-devices

[![NPM version](https://img.shields.io/npm/v/iobroker.test-devices.svg)](https://www.npmjs.com/package/iobroker.test-devices)
[![Downloads](https://img.shields.io/npm/dm/iobroker.test-devices.svg)](https://www.npmjs.com/package/iobroker.test-devices)
![Number of Installations](https://iobroker.live/badges/test-devices-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/test-devices-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.test-devices.png?downloads=true)](https://nodei.co/npm/iobroker.test-devices/)

**Tests:** ![Test and Release](https://github.com/OlliMartin/ioBroker.test-devices/workflows/Test%20and%20Release/badge.svg)

>**THIS ADAPTER IS NOT INTENDED TO BE USED PRODUCTIVELY**
>
> It should never be published into the latest or stable ioBroker repository!

## Test-Devices for ioBroker Development

The `test-devices` adapter allows creation and simulation of devices in an automated fashion.

It will generate devices that follow the detection rules defined in the [ioBroker.type-detector](https://github.com/ioBroker/ioBroker.type-detector/tree/master) utility, 
which means the generated devices will follow the semi-standardized patterns so that the `type-detector` will recognize each device. 
Refer to the [Developer Section](#developer-section) below. 

The adapter will acknowledge every state change immediately, which makes it particularly useful for development of adapters
that rely on the devices of other adapters.

## Developer Section

This section outlines the high level architecture behind the `test-devices` adapter.

1. On startup (`onReady`), the adapter uses the `ChannelDetector.getPatterns()` function of the 
   [ioBroker.type-detector](https://github.com/ioBroker/ioBroker.type-detector/tree/master) package to retrieve 
   all possibly known device types and their metadata.
2. The device metadata is filtered for devices where all `required` states have a matching `defaultRole`
    - __Note:__ Devices where states exist that are required but do _not_ define a `defaultRole` cannot be handled.
    
      At the time of writing (2026-01-09) __no such devices__ exist, which means all devices maintained in `type-detector` will be created
3. For all valid devices (only required states):
   1. A `device` with `name=$device.type` is created (no specific metadata)
   2. Within the created channel, all required states are created with their respective metadata:
   ```js
   {
     type: 'state',
       common: {
         name: state.name,
         type: type,
         read: state.read ?? true, // If the value is omitted in type-detector we assume readable
         write: state.write ?? false,
         role: state.defaultRole,
         unit: state.defaultUnit,
       }   
     }
   }
   ```
4. For all valid devices (all states):
   1. A `device` with `name=$device.type` is created (no specific metadata)
   2. Within the created channel, all (including optional) states are created with their respective metadata. 
      If a `defaultRole` is defined more than once, multiple states are created with the same role. 
5. The adapter subscribes to all existing/created states and acknowledges any received value change.

### Triggering State Updates

~~As a first step, acknowledging state updates done through the UI should be sufficient.~~

For read-only states a mechanism is required to update the value of the state, since it cannot be easily done through the UI.
To achieve this, the adapter will generate a single button at the root of the namespace, which, when pressed, will generate 
new random values for _all_ read-only states.

Since the `type-detector` does not define the possible value range in its metadata, we will use the `defaultUnit` to 
make an educated guess what the values should be. The following table illustrates the units and their respective value range:

~Todo during implementation

| Default Unit | Value Min | Value Max |
|--------------|-----------|-----------|
|              |           |           |

If required, we could extend this to include scheduled updates - for example - or offer a message (`onMessage`)
that updates the provided state. The latter approach works well for testing scenarios where the actual testing happens outside
of ioBroker and there is the possibility to send these messages from the system under test.

### Testing

The goal of the adapter testing is pretty clear:

We want all created/simulated devices to pass as the device _itself_ when identified by the `type-detector` utility.

It should be possible to verify this via integration tests, where the tests verify that each individual type 
(defined within `type-detector`) has at least one match after the adapter is ready.

For stability, and since we have a very high dependency on `type-detector`, it should be ensured that each device defined
there can be created in this adapter. This test will (automatically) enforce that all types available are actually creatable 
in the scenario where the `type-detector` dependency was upgraded.
In case this test fails we may communicate it to the maintainer of `type-detector`, since it only happens if a state has no default role.

### Misc

As of writing (2026-01-09), there exist 26 states in the `type-detector` utility that do not define a `defaultRole`:

| Device          | Name                   | Type   | Role Regex                                      |
|-----------------|------------------------|--------|-------------------------------------------------|
| chart           | CHART                  | N/A    | `undefined`                                     |
| cie             | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| ct              | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| hue             | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| mediaPlayer     | COVER                  | string | `/^media\.cover(\..*)$/`                        |
| mediaPlayer     | IGNORE                 | N/A    | `undefined`                                     |
| rgb             | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| rgbSingle       | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| rgbwSingle      | BRIGHTNESS             | number | `/^level\.brightness$/`                         |
| vacuumCleaner   | MAP_URL                | string | `/vacuum\.map\.url$/`                           |
| warning         | START                  | string | `/^date$/`                                      |
| weatherForecast | DATE%d                 | string | `/^date\.forecast\.(\d+)$/`                     |
| weatherForecast | DOW%d                  | string | `/^dayofweek\.forecast\.(\d+)$/`                |
| weatherForecast | HUMIDITY_MAX%d         | number | `/^value\.humidity\.max\.forecast\.(\d+)$/`     |
| weatherForecast | HUMIDITY%d             | number | `/^value\.humidity\.forecast\.(\d+)$/`          |
| weatherForecast | ICON%d                 | string | `/^weather\.icon\.forecast.(\d+)$/`             |
| weatherForecast | PRECIPITATION_CHANCE%d | number | `/^value\.precipitation\.forecast\.(\d+)$/`     |
| weatherForecast | PRECIPITATION%d        | number | `/^value\.precipitation\.forecast\.(\d+)$/`     |
| weatherForecast | STATE%d                | string | `/^weather\.state\.forecast\.(\d+)$/`           |
| weatherForecast | TEMP_MAX%d             | number | `/^value\.temperature\.max\.forecast\.(\d+)$/`  |
| weatherForecast | TEMP_MIN%d             | number | `/^value\.temperature\.min\.forecast\.(\d+)$/`  |
| weatherForecast | TEMP%d                 | number | `/^value\.temperature\.forecast\.(\d+)$/`       |
| weatherForecast | WIND_DIRECTION_STR%d   | string | `/^weather\.direction\.wind\.forecast\.(\d+)$/` |
| weatherForecast | WIND_DIRECTION%d       | number | `/^value\.direction\.wind\.forecast\.(\d+)$/`   |
| weatherForecast | WIND_ICON%d            | string | `/^weather\.icon\.wind\.forecast\.(\d+)$/`      |
| weatherForecast | WIND_SPEED%d           | number | `/^value\.speed\.wind\.forecast\.(\d+)$/`       |

### Object Tree

Refer to exported object tree [here](./development/test-devices.json) for all generated states.

### ~~Extension of Devices~~

**THIS SECTION IS OBSOLETE AND ONLY PLACED HERE FOR REFERENCE**

With the above approach most devices only have one or two different states, and it is unlikely that they are truly usable.
(As of writing, there are 41 devices defined with a total of 496 states, but only 50 are required)
However, maintaining device-specific configuration outside the `type-detector` utility is discouraged, so the following approach is proposed
to make the devices appear more like they would exist in the real world:

We will allow the users to define a per-device mapping of additional states that should be created, where the key
of the mapping is the device type and the value is the name of the additional (not required) state.

This changes step 3 in the section above to look up the device in the adapter config, find the additionally requested states
(continue if not found) and create them as well - again using the `defaultRole` and other metadata.
**TBD:** The typescript type seems to be straight forward to define, basically `Record<Types, string[] | undefined>` *,
but populating the types in the JSON UI may not be as easy.

Ideally, the solution allows us to deliver a basic setup for additional states within the `io-package.json`
(in `$.native.mapping` or similar property), which still can be edited through the JSON UI.
This way the developer/consumer can still pull in more states if the standard configuration does not suffice.

> Thinking Aloud: The JSON UI is literally a JSON file, so we cannot rely on any of the types provided by `type-detector` anyway.

Since we are not able to dynamically populate the static JSON file we should automate the process, i.e. have a NPM script
that (re-)generates the JSON UI and `$.native.mapping` property pre-build.

We would need a source-of-truth for the script where the standard mapping (additional states) are defined; Then we can generate
a UI where each device gets a section and a list of states with checkboxes each. The checkboxes reference a value inside the
adapter configuration (defaulted from `$.native`) to determine their value. **

\* Having the type as trivial as this will probably not work together with the JSON UI.

\** We need to exclude non-required states without a `defaultRole` populated

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
* (OlliMartin) initial release

## License
MIT License

Copyright (c) 2026 OlliMartin <oss@ollimart.in>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.