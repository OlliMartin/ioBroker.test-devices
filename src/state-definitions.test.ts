/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.ts-files
 */
import fs from 'node:fs/promises';
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
		deviceMetadata = getDeviceMetadata(_ => null);
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

	it('[NoOp Test] Generate State Markdown', async () => {
		const { trackedValueGenerators } = executeStateCreation(deviceMetadata);

		let markdown = `
# Important

Note: This file should not be updated manually. It is auto-generated and to be consumed by AI (agents).
For brevity, the list omits all \`boolean\` states.

The following table lists the state mappings defined in [value-generator.defs.ts](../src/value-generator.defs.ts), 
inside the constant \`commonValueGenerators\`.

All states originate from the ioBroker.type-detector module [here](https://github.com/ioBroker/ioBroker.type-detector/blob/master/src/typePatterns.ts).
Refer to the [README.md](../README.md) for more information about this adapter.

The value generators follow this structure in their typescript definition:

\`\`\`
{
	u: "<The unit of the state, if present>"
	t: "<The type of the state in ioBroker>"
	d: ["<The name of the devices as defined in type-detector>"]
	s: ["<The name of the states as defined in type-detector>"]
	gen: <The generator function for the next state. This is implicitly set through WRAPPERS>
	description: "<A description of how the values are generated>"
}
\`\`\`

There are a few wrappers available:
- \`NumberRange($min, $max, $decimalPlaces)\` - Generates the next number randomly in the provided range. In a description this wrapper has the form: Num[$min..$max|P$decimalPlaces]
- \`RandomNumber\` - This wrapper indicates that a state is not yet properly handled and should be changed
- \`Toggle\` - This is the default value generator for \`boolean\` states. It toggles the value 

# State Mappings

| Device | State Name | Role | Unit | Value Type | Remark/Description |
| ------ | ---------- | ---- | ---- | ---------- | ------------------ |
`;

		for (const vgDef of trackedValueGenerators
			.filter(vgDef => vgDef.stateDef.commonType !== 'boolean')
			.sort((a, b) => a.stateDef.state.name.localeCompare(b.stateDef.state.name))
			.sort((a, b) => a.stateDef.device.name.localeCompare(b.stateDef.device.name))) {
			markdown += `| ${vgDef.stateDef.device.name} | ${vgDef.stateDef.state.name} | ${vgDef.stateDef.state.defaultRole ?? ''} | ${vgDef.stateDef.state.defaultUnit ?? ''} | ${vgDef.stateDef.commonType} | ${vgDef.valueGenerators[0].isFallback ? 'TODO' : (vgDef.valueGenerators[0].description ?? '')} |\n`;
		}

		await fs.writeFile('./automated.ai/state-defs.md', markdown, 'utf8');
	});

	it(`should not fall back value generators`, () => {
		const { trackedValueGenerators } = executeStateCreation(deviceMetadata);

		allSatisfy(trackedValueGenerators, vg =>
			expect(vg.valueGenerators[0].isFallback).to.be.not.equal(
				true,
				`${summarizeStateDefinition(vg.stateDef)} uses a fallback value generator.`,
			),
		);
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
