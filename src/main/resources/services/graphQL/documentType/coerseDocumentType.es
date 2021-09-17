// It seems scoped packages are not resolved in *.mjs files,
// so let's stay at *.es for files used on the server-side.
// https://webpack.js.org/guides/ecma-script-modules/
// Only the "default" export can be imported from non-ESM. Named exports are not available.
//import utils from '@enonic/js-utils';
//const forceArray = utils.forceArray;

import {forceArray} from '@enonic/js-utils';


export function coerseDocumentType({
	_id,
	_name,
	_path,
	_versionKey,
	fields,
	properties
}) {
	return {
		_id,
		_name,
		_path,
		_versionKey,
		fields: forceArray(fields), // GraphQL Schema doesn't ensure array
		properties: forceArray(properties) // GraphQL Schema doesn't ensure array
	};
}
