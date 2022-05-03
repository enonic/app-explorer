const STARTS_WITH_ANYTHING_BUT_LOWERCASE_LETTER_REGEXP = /^[^a-z]/;


export function mustStartWithALowercaseLetter(v) {
	const startsWithAnythingButLowercaseLetter = v.match(STARTS_WITH_ANYTHING_BUT_LOWERCASE_LETTER_REGEXP);
	if (startsWithAnythingButLowercaseLetter) {
		return `Must start with a lowercase letter. Illegal characters: ${startsWithAnythingButLowercaseLetter.join('')}`;
	}
}
