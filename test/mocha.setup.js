'use strict';

// Makes ts-node ignore warnings, so mocha --watch does work
process.env.TS_NODE_IGNORE_WARNINGS = 'TRUE';
// Sets the correct tsconfig for testing
process.env.TS_NODE_PROJECT = 'tsconfig.json';
// Make ts-node respect the "include" key in tsconfig.json
process.env.TS_NODE_FILES = 'TRUE';

// Don't silently swallow unhandled rejections
process.on('unhandledRejection', e => {
	throw e;
});

// enable the should interface with sinon
// and load chai-as-promised and sinon-chai by default
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { should, use } = require('chai');

should();
use(sinonChai);
use(chaiAsPromised);

// Export mocha hooks (ESM-friendly) so Mocha loads them correctly when the file
// is required as an ESM module. This avoids "ReferenceError: before is not defined".
export const mochaHooks = {
	async beforeAll(mochaContext) {
		// 20s should be enough for setup on CI
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore: mocha adds `this` to the hook context
		mochaContext.timeout(20000);
	},
};
