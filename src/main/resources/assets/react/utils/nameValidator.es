/***
 * Validated if the input document type name is valid
 * @param {String} v String name of the new document type
 * @return Object
 * @returns {string | undefined} possible error string or true
 */
export function nameValidator(v) {
	if(!v) {
		return 'Required!';
	}
	const startsWithAnythingButLowercaseLetterRegexp = /^[^a-z]/;
	const startsWithAnythingButLowercaseLetter = v.match(startsWithAnythingButLowercaseLetterRegexp);
	if (startsWithAnythingButLowercaseLetter) {
		return `Must start with a lowercase letter. Illegal characters: ${startsWithAnythingButLowercaseLetter.join('')}`;
	}

	const disallowedRegexp = /[^a-zA-Z0-9_]/g;
	const matches = v.match(disallowedRegexp);
	if (matches) {
		return `Only letters, digits and underscore is allowed. Illegal characters: ${matches.join('')}`;
	}
	return undefined;
}
