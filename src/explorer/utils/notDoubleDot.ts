const DOUBLE_DOT_REGEXP = /\.\./;


export function notDoubleDot(v) {
	const matches = v.match(DOUBLE_DOT_REGEXP);
	if (matches) {
		return 'Double dot is not allowed!';
	}
}
