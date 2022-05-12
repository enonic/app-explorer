// Similar to @enonic/js-utils isValidGraphQLName() which is based on
// https://spec.graphql.org/April2016/#Name

/***
 * Validated if the input document type name is valid
 * @param {String} v String name of the new document type
 * @return Object
 * @returns {string | undefined} possible error string or true
 */
export function nameValidator(v :string) :string|false {
	if(!v) {
		return 'Required!';
	}
	const startsWithAnythingButLowercaseLetterRegexp = /^[^a-z]/;
	const startsWithAnythingButLowercaseLetter = v.match(startsWithAnythingButLowercaseLetterRegexp);
	if (startsWithAnythingButLowercaseLetter) {
		return `Must start with a lowercase letter. Illegal characters: ${startsWithAnythingButLowercaseLetter.join('')}`;
	}

	const disallowedRegexp = /[^a-z0-9_]/g;
	const matches = v.match(disallowedRegexp);
	if (matches) {
		return `Only lowercase letters, digits and underscores are allowed. Illegal characters: ${matches.join('')}`;
	}
	return false;
}
