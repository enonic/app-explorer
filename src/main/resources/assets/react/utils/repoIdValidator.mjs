import {isString} from '@enonic/js-utils';


export function repoIdValidator(repoId) {
	if(!repoId) {
		return 'Required!';
	}
	if (!isString(repoId)) {
		return 'Must be a string!';
	}
	if (repoId === '') {
		return "Can't be an empty string!";
	}

	const firstChar = repoId.charAt(0);
	const firstCharCode = firstChar.charCodeAt(0);
	if (
		firstCharCode < 97 // a
		|| firstCharCode > 122 // z
	) {
		return 'Must start with a lowercase letter a-z!';
	}
	for (var i = 1; i < repoId.length; i++) {
		const char = repoId.charAt(i);
		const code = char.charCodeAt(0);
		//console.debug(`char:${toStr(char)} charCode:${code}`)
		if (!(
			//code === 45 // -
			//|| code === 46 // .
			//||
			(
				code >= 48 // 0
				&& code <= 57 // 9
				//&& code <= 58 // :
			)
			|| code === 95 // _
			|| (
				code >= 97 // a
				&& code <= 122 // z
			) // a-z
		)) {
			return `Can only contain 1-9 _ a-z!`;
		}
	}
}
