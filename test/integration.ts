import { tests } from '@iobroker/testing';
import assert from 'assert';
import { type TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';
import ChannelDetector from '@iobroker/type-detector';

// Use process.cwd() as the repository root. Mocha runs tests from the project
// root, so `process.cwd()` points to the repo root here.
const projectRoot = process.cwd();

const sendToAsync = (harness, instance, command, message) => {
	return new Promise(resolve => {
		harness.sendTo(instance, command, message, resp => {
			resolve(resp);
		});
	});
};

const deviceTypeBlacklist = ['chart'];
const relevantDeviceTypes = Object.keys(ChannelDetector.getPatterns()).filter(k => !deviceTypeBlacklist.includes(k));

tests.integration(projectRoot, {
	allowedExitCodes: [11, 15],
	controllerVersion: 'latest',
	waitBeforeStartupSuccess: 5000,
	defineAdditionalTests({ suite }) {
		suite('simulated-device-creation', getHarness => {
			let harness: TestHarness;

			before(async () => {
				harness = getHarness();
				await harness.startAdapterAndWait(true);
				await harness.enableSendTo();
			});

			for (const deviceType of relevantDeviceTypes) {
				it(`Should create discoverable device with type ${deviceType}`, async () => {
					const response = await sendToAsync(harness, 'test-devices.0', 'VERIFY_DEVICE_TYPE', deviceType);
					assert.equal(response, 'SUCCESS');
				});
			}

			for (const generationType of ['required', 'all']) {
				for (const deviceType of relevantDeviceTypes) {
					it(`Should generate a button for device ${generationType}.${deviceType}`, async () => {
						const expectedId = `test-devices.0.triggers.${generationType}.${deviceType}`;
						const state = await harness.states.getState(expectedId);

						assert.notEqual(state, null, `Expected state ${expectedId} to exist, but it does not.`);
					});
				}
			}
		});
	},
});

export {};
