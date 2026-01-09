import { tests } from '@iobroker/testing';
import assert from 'assert';
import { type TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';
import ChannelDetector, { type DetectOptions } from '@iobroker/type-detector';

// Use process.cwd() as the repository root. Mocha runs tests from the project
// root, so `process.cwd()` points to the repo root here.
const projectRoot = process.cwd();

const sendToAsync = (harness: any, instance: string, command: string, message?: unknown): Promise<unknown> => {
	return new Promise(resolve => {
		harness.sendTo(instance, command, message ?? 'PLACEHOLDER_MESSAGE', resp => {
			resolve(resp as unknown);
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
			const objects: Record<string, ioBroker.Object> = {};
			const detector: ChannelDetector = new ChannelDetector();

			before(async () => {
				harness = getHarness();
				await harness.startAdapterAndWait(true);
				await harness.enableSendTo();

				const allDeviceStates = await sendToAsync(harness, 'test-devices.0', 'GET_DEVICE_STATES', 'rgb');

				if (!Array.isArray(allDeviceStates)) {
					throw new Error("Expected call to 'GET_DEVICE_STATES' to return array of string, but it did not.");
				}

				for (const fqObj of allDeviceStates) {
					objects[fqObj] = await harness.objects.getObjectAsync(fqObj);
				}
			});

			for (const deviceType of relevantDeviceTypes) {
				it(`Should evaluate device with type ${deviceType} successfully`, async () => {
					const response = await sendToAsync(harness, 'test-devices.0', 'VERIFY_DEVICE_TYPE', deviceType);
					assert.equal(response, 'SUCCESS');
				});
			}

			for (const generationType of ['required', 'all']) {
				for (const deviceType of relevantDeviceTypes) {
					it(`Should create discoverable device with type ${generationType}.${deviceType}`, () => {
						const expectedChannel = `test-devices.0.devices.${generationType}.${deviceType}`;

						const options: DetectOptions = {
							objects: objects,
							id: expectedChannel,
						};

						const controls = detector.detect(options);

						if (!controls) {
							assert.fail(`No matches found for ${options.id}`);
						} else if (controls && controls.length > 1) {
							const foundDeviceTypes = controls.map(c => c.type).join(', ');
							if (foundDeviceTypes.includes(deviceType)) {
								return;
							}

							assert.fail(
								`Too many matches found for ${options.id}, but none of them matches expected type '${deviceType}': [${foundDeviceTypes}]`,
							);
						}
					});
				}
			}

			for (const generationType of ['required', 'all']) {
				for (const deviceType of relevantDeviceTypes) {
					it(`Should generate a button for device ${generationType}.${deviceType}`, async () => {
						const expectedId = `test-devices.0.triggers.${generationType}.${deviceType}`;
						const state = await harness.objects.getObjectAsync(expectedId);

						// console.log('REC STATE', state);

						assert.notEqual(state, null, `Expected state ${expectedId} to exist, but it does not.`);
					});
				}
			}
		});
	},
});

export {};
