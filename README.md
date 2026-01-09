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
3. For all valid devices:
   1. A `channel` with `name=$device.type` is created (no specific metadata)
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
4. The adapter subscribes to all existing/created states and acknowledges any received value change.

### Extension of Devices

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
adapter configuration (defaulted from `$.native`) to determine their value.

\* Having the type as trivial as this will probably not work together with the JSON UI.

### Triggering State Updates

As a first step, acknowledging state updates done through the UI should be sufficient.

If required, we could extend this to include scheduled updates - for example - or offer a command (probably the wrong naming)
that updates the provided state. The latter approach works well for testing scenarios where the actual testing happens outside
of ioBroker and there is the possibility to send these commands from the system under test.


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