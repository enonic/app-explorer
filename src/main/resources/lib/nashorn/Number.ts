Number.isInteger = Number.isInteger || function(value) {
	return typeof value === 'number' &&
	isFinite(value) &&
	Math.floor(value) === value;
};

// core-js(-pure)/es|stable|actual|full/number/is-finite
// Number.isFinite = Number.isFinite || isFinite;
