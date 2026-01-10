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
			read: boolean;
			write: boolean;
			valueGenerator?: ioBroker.ValueGenerator<ioBroker.StateValue>;
		}

		type DeviceStatesGenerationType = 'all' | 'required';

		type GenerationTypes = readonly ioBroker.DeviceStatesGenerationType[];

		type DeviceFilterType = Record<
			ioBroker.DeviceStatesGenerationType,
			(ctx: ioBroker.DeviceFilterContext, state: ExternalDetectorState) => boolean
		>;

		type ValueGenerator<T extends StateValue> = (
			stateDefinition: DeviceStateDefinition,
			stateValue?: StateValue,
		) => T;

		// Probably there is a smarter way to achieve this.
		type StringValueGeneratorDefinition = {
			t: 'string';
			gen: ValueGenerator<string>;
		};

		type NumberValueGeneratorDefinition = {
			t: 'number';
			gen: ValueGenerator<number>;
		};

		type BooleanValueGeneratorDefinition = {
			t: 'boolean';
			gen: ValueGenerator<boolean>;
		};

		type ValueGeneratorBase = {
			u: string;

			d?: string[];
			s?: string[];

			isFallback?: boolean;
			description?: string;
		};

		type ValueGeneratorDefinition = ValueGeneratorBase &
			(StringValueGeneratorDefinition | NumberValueGeneratorDefinition | BooleanValueGeneratorDefinition);
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
