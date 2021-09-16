import {
	VALUE_TYPE_STRING,
	isNotSet//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {field} from '/lib/explorer/model/2/nodeTypes/field';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';


export function createField({
	key, // Required

	// Optional:
	decideByType,
	description,
	enabled,
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
	if (isNotSet(description)) { description = ''; }
	if (isNotSet(enabled)) { enabled = true; }
	if (isNotSet(fieldType)) { fieldType = VALUE_TYPE_STRING; }
	if (isNotSet(fulltext)) { fulltext = true; }
	if (isNotSet(includeInAllText)) { includeInAllText = true; }
	if (isNotSet(instruction)) { instruction = 'type'; }
	if (isNotSet(max)) { max = 0; }
	if (isNotSet(min)) { min = 0; }
	if (isNotSet(nGram)) { nGram = true; }
	if (isNotSet(path)) { path = false; }

	const lcKey = key.toLowerCase();
	const nodeToCreate = field({
		_name: lcKey,
		description,
		fieldType,
		key: lcKey,
		max: parseInt(max,10),
		min: parseInt(min,10),
		instruction,

		// NOTE
		// If instruction is 'custom' these get stored under indexConfig
		// If instruction is NOT 'custom' these are NOT stored
		decideByType,
		enabled,
		fulltext,
		includeInAllText,
		nGram,
		path
	});
	//log.debug(`nodeToCreate:${toStr(nodeToCreate)}`);

	const createdNode = create(nodeToCreate, {
		connection: connect({principals: PRINCIPAL_EXPLORER_WRITE})
	});
	//log.debug(`createdNode:${toStr(createdNode)}`);

	if(!createdNode) {
		throw new Error(`Something went wrong when trying to create field with key:${lcKey}.`);
	}
	return createdNode;
} // createField
