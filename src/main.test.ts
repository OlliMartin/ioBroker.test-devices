/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.ts-files
 */

import { expect } from 'chai';
import { getDeviceMetadata, createDesiredStateDefinitions } from './main';

describe('createDesiredStateDefinitions', () => {
	let deviceMetadata: ioBroker.DeviceDefinition[];

	before(() => {
		deviceMetadata = getDeviceMetadata();
	});

	it(`should not fall back value generators`, () => {
		const stateDefinitions = createDesiredStateDefinitions('test-devices.0', {}, deviceMetadata);

		expect(stateDefinitions.length).to.be.greaterThan(0);
	});
});
