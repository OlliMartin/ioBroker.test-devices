// This file extends the AdapterConfig type from "@iobroker/types"

// Augment the globally declared type ioBroker.AdapterConfig
import { Types } from '@iobroker/type-detector';

declare global {
	namespace ioBroker {
		interface AdapterConfig {}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
