const CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_UNDERSCORES_AND_DOTS_REGEXP = /[^a-z0-9_.]/g;


export function onlyLowercaseAsciiLettersDigitsUnderscoresAndDots(v) {
	const matches = v.match(CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_UNDERSCORES_AND_DOTS_REGEXP);
	//console.debug('i', i, 'name', name, 'matches', matches);
	if (matches) {
		return `Only lowercase ascii letters, digits, underscores and dots are allowed. /a-z0-9_./ Illegal characters: ${matches.join('')}`;
	}
}
