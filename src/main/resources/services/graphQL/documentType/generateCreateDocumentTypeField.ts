import {
	isNotFalse,
	isNull//,
	//toStr
} from '@enonic/js-utils';
import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
//@ts-ignore
import {list} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME
} from '../constants';


export function generateCreateDocumentTypeField({
	GQL_INPUT_TYPE_ADD_FIELDS,
	glue
}) {
	return {
		args: {
			_name: glue.getScalarType('_name'),
			addFields: GQL_INPUT_TYPE_ADD_FIELDS,
			properties: list(glue.getInputType(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME))
		},
		resolve({
			args: {
				_name,
				addFields,// = true, // GraphQL sends null so default value is not applied
				properties// = [] // GraphQL sends null so default value is not applied
			}
		}) {
			if (isNotFalse(addFields)) { addFields = true; }
			if (isNull(properties)) { properties = []; }
			//log.debug(`_name:${_name} addFields:${addFields} fields:${toStr(fields)} properties:${toStr(properties)}`);
			return createDocumentType({_name, addFields, properties});
		}, // resolve
		type: glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_NAME)
	};
}
