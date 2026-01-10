export const getFallbackValueGenerator = (): ioBroker.ValueGenerator<ioBroker.StateValue> => {
	return (sd, _) => {
		if (sd.commonType === 'number') {
			return Math.random();
		}
		if (sd.commonType === 'string') {
			return Math.random().toFixed(2);
		}
		if (sd.commonType === 'boolean') {
			return Math.random() > 0.5;
		}

		return Math.random();
	};
};

export const getToggleBoolValueGenerator = (): ioBroker.ValueGenerator<boolean> => {
	return (_, val) => !val;
};

export const getNumberRangeGenerator = (
	min: number,
	max: number,
	decimals: number,
): ioBroker.ValueGenerator<number> => {
	return (_1, _2) => {
		return Number((Math.random() * (max - min) + min).toFixed(decimals));
	};
};

export const getRandomNumberGenerator = (): ioBroker.ValueGenerator<number> => {
	return getNumberRangeGenerator(0, 20000, 2);
};

export const adjustType = <TIn extends ioBroker.StateValue, TOut extends ioBroker.StateValue>(
	inputValueGen: ioBroker.ValueGenerator<TIn>,
	convert: (intermediate: TIn) => TOut,
): ioBroker.ValueGenerator<TOut> => {
	return (dsd, val) => convert(inputValueGen(dsd, val));
};
