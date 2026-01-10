/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.ts-files
 */

import { expect } from 'chai';
import { getDeviceMetadata } from './device-metadata';
import { createDesiredStateDefinitions } from './state-definitions';
import { summarizeStateDefinition } from './utils';

type TestCaseSetup = {
	trackedValueGenerators: {
		stateDef: ioBroker.DeviceStateDefinition;
		valueGenerators: ioBroker.ValueGeneratorDefinition[];
	}[];
	stateDefinitions: Record<string, ioBroker.DeviceStateDefinition>;
};

const allSatisfy = <T>(items: T[], assertion: (item: T) => void): void => {
	const errors = [];
	for (const item of items) {
		try {
			assertion(item);
		} catch (err) {
			if (Object.hasOwnProperty.call(err, 'message')) {
				console.log((err as { message: string }).message);
			}

			errors.push(err);
		}
	}

	expect(errors).to.be.empty;
};

describe('createDesiredStateDefinitions', () => {
	let deviceMetadata: ioBroker.DeviceDefinition[];

	before(() => {
		deviceMetadata = getDeviceMetadata();
	});

	const executeStateCreation = (deviceMetadata: ioBroker.DeviceDefinition[]): TestCaseSetup => {
		const trackedValueGenerators: {
			stateDef: ioBroker.DeviceStateDefinition;
			valueGenerators: ioBroker.ValueGeneratorDefinition[];
		}[] = [];

		const fallbackCb = (sd: ioBroker.DeviceStateDefinition, vg: ioBroker.ValueGeneratorDefinition[]): void => {
			trackedValueGenerators.push({ stateDef: sd, valueGenerators: vg });
		};

		const stateDefinitions = createDesiredStateDefinitions('test-devices.0', {}, deviceMetadata, fallbackCb);

		return { trackedValueGenerators, stateDefinitions };
	};

	it(`should not fall back value generators`, () => {
		const { stateDefinitions } = executeStateCreation(deviceMetadata);

		expect(Object.keys(stateDefinitions).length).to.be.greaterThan(0);
	});

	it('should assign value generator for each state def', () => {
		const { stateDefinitions } = executeStateCreation(deviceMetadata);

		allSatisfy(Object.values(stateDefinitions), sd => {
			expect(sd.valueGenerator).to.be.not.undefined;
		});
	});

	it(`should track value generators for all states`, () => {
		const { trackedValueGenerators, stateDefinitions } = executeStateCreation(deviceMetadata);

		const stateCount = Object.keys(stateDefinitions).length;
		expect(trackedValueGenerators.length).to.be.equal(stateCount);
	});

	it(`should never identify more than one value generator with identical score`, () => {
		const { trackedValueGenerators } = executeStateCreation(deviceMetadata);

		allSatisfy(trackedValueGenerators, tvGen => {
			expect(tvGen.valueGenerators.length).to.be.greaterThan(0);
			expect(tvGen.valueGenerators.length).to.be.lessThan(
				2,
				`Found more than one value generator for ${summarizeStateDefinition(tvGen.stateDef)}`,
			);
		});
	});
});
