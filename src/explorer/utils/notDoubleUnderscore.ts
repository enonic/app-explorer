const DOUBLE_UNDERSCORE_REGEXP = /__/;


export function notDoubleUnderscore(v) {
	const matches = v.match(DOUBLE_UNDERSCORE_REGEXP);
	if (matches) {
		return 'Double underscore is not allowed!';
	}
}
