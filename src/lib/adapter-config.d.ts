// This file extends the AdapterConfig type from "@iobroker/types"

// Augment the globally declared type ioBroker.AdapterConfig
import { type ExternalDetectorState, type Types } from '@iobroker/type-detector';

declare global {
	namespace ioBroker {
		interface AdapterConfig {}

		type DeviceDefinition = {
			states: ExternalDetectorState[];
			type: Types;
			enumRequired?: boolean;
			name: string;
		};

		type StateWithDeviceRef = ExternalDetectorState & {
			deviceRef: DeviceDefinition;
		};

		// Not used for now; May be handy in the future.
		interface DeviceFilterContext {
			device: DeviceDefinition;
			config: ioBroker.AdapterConfig;
		}

		interface DeviceStateDefinition {
			state: ExternalDetectorState;
			stateFqn: string;
			deviceType: string;
			deviceRoot: string;
			generationType: DeviceStatesGenerationType;
			device: DeviceDefinition;
			commonType: ioBroker.CommonType;
			isReadOnly: boolean;
		}

		type DeviceStatesGenerationType = 'all' | 'required';

		type GenerationTypes = readonly ioBroker.DeviceStatesGenerationType[];

		type DeviceFilterType = Record<
			ioBroker.DeviceStatesGenerationType,
			(ctx: ioBroker.DeviceFilterContext, state: ExternalDetectorState) => boolean
		>;
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
