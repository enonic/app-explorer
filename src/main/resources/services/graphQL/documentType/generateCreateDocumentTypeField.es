import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {list} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS_NAME,
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
			fields: list(glue.getInputType(GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS_NAME)),
			properties: list(glue.getInputType(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME))
		},
		resolve({
			args: {
				_name,
				addFields = true,
				fields = [],
				properties = []
			}
		}) {
			return createDocumentType({_name, addFields, fields, properties});
		}, // resolve
		type: glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_NAME)
	};
}
