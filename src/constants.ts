export const GetDeviceFolderName = (): string => {
	return 'devices';
};

export const GetTriggerFolderName = (): string => {
	return 'triggers';
};

// Heck, I can't get typescript to enforce that the array here consists of all properties of the type.
// If a new type is introduced one line above, it must be added here too :/
export const generationTypes: ioBroker.GenerationTypes = ['all', 'required'];

export const deviceFilter: ioBroker.DeviceFilterType = {
	all: (_1, _2) => true,
	required: (_, s) => !!s.required,
};
