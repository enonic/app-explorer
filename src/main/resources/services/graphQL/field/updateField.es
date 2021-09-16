import {
	VALUE_TYPE_STRING,
	isNotSet//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
//import {field} from '/lib/explorer/model/2/nodeTypes/field';
import {modify} from '/lib/explorer/node/modify';
import {connect} from '/lib/explorer/repo/connect';

export function updateField({
	_id, // Required

	// Optional
	decideByType,
	enabled,
	description,
	fieldType, // TODO valueType
	fulltext,
	includeInAllText,
	instruction,
	max,
	min,
	nGram,
	path
}) {

	// Handle null values
	if (isNotSet(decideByType)) { decideByType = true; }
	if (isNotSet(enabled)) { enabled = true; }
	if (isNotSet(description)) { description = ''; }
	if (isNotSet(fieldType)) { fieldType = VALUE_TYPE_STRING; }
	if (isNotSet(fulltext)) { fulltext = true; }
	if (isNotSet(includeInAllText)) { includeInAllText = true; }
	if (isNotSet(instruction)) { instruction = 'type'; }
	if (isNotSet(max)) { max = 0; }
	if (isNotSet(min)) { min = 0; }
	if (isNotSet(nGram)) { nGram = true; }
	if (isNotSet(path)) { path = false; }

	//const lcKey = key.toLowerCase();
	const propertiesToUpdate = {
		_id,
		description,
		fieldType,
		max: parseInt(max,10),
		min: parseInt(min,10),
		indexConfig: instruction === 'custom' ? {
			decideByType,
			enabled,
			nGram,
			fulltext,
			includeInAllText,
			path
		} : instruction
	};
	//log.debug(`propertiesToUpdate:${toStr(propertiesToUpdate)}`);

	const updatedNode = modify(propertiesToUpdate, {
		connection: connect({principals: PRINCIPAL_EXPLORER_WRITE})
	});
	//log.debug(`updatedNode:${toStr(updatedNode)}`);

	if(!updatedNode) {
		throw new Error(`Something went wrong when trying to update field with _id:${_id}.`);
	}
	return updatedNode;
} // updateField
