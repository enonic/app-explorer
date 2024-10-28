const CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_AND_UNDERSCORES_REGEXP = /[^a-zA-Z0-9_]/g;


export function onlyLettersDigitsAndUnderscores(v) {
	const matches = v.match(CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_AND_UNDERSCORES_REGEXP);
	//console.debug('i', i, 'name', name, 'matches', matches);
	if (matches) {
		return `Only letters, digits and underscores are allowed. Illegal characters: ${matches.join('')}`;
	}
}
