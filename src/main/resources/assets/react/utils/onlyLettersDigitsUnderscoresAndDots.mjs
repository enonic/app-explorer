const CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_UNDERSCORES_AND_DOTS_REGEXP = /[^a-zA-Z0-9_.]/g;


export function onlyLettersDigitsUnderscoresAndDots(v) {
	const matches = v.match(CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_UNDERSCORES_AND_DOTS_REGEXP);
	//console.debug('i', i, 'name', name, 'matches', matches);
	if (matches) {
		return `Only letters, digits, underscore and dot is allowed. Illegal characters: ${matches.join('')}`;
	}
}
