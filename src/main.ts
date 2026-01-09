import * as utils from '@iobroker/adapter-core';

class TestDevices extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'test-devices',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	private async onReady(): Promise<void> {}

	private onUnload(callback: () => void): void {
		try {
			// nothing to do yet
		} catch (error) {
			this.log.error(`Error during unloading: ${(error as Error).message}`);
		} finally {
			callback();
		}
	}
}
if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TestDevices(options);
} else {
	// otherwise start the instance directly
	(() => new TestDevices())();
}
