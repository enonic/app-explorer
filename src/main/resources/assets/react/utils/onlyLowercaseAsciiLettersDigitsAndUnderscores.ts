const CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_AND_UNDERSCORES_REGEXP = /[^a-z0-9_]/g;


export function onlyLowercaseAsciiLettersDigitsAndUnderscores(v :string) {
	const matches = v.match(CONTAIN_ANYTHING_BUT_LETTERS_DIGITS_AND_UNDERSCORES_REGEXP);
	//console.debug('i', i, 'name', name, 'matches', matches);
	if (matches) {
		return `Only lowercase ascii letters, digits and underscores are allowed. /a-z0-9_/ Illegal characters: ${matches.join('')}`;
	}
}
