//import {toStr} from '@enonic/js-utils';

import {updateDocumentType} from '/lib/explorer/documentType/updateDocumentType';
import {
	GraphQLString,
	list
} from '/lib/graphql';


export function generateUpdateDocumentTypeField({
	GQL_INPUT_TYPE_ADD_FIELDS,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
	GQL_TYPE_DOCUMENT_TYPE,
	GQL_TYPE_ID,
	GQL_TYPE_NAME
}) {
	return {
		args: {
			_id: GQL_TYPE_ID,
			_name: GQL_TYPE_NAME,
			_versionKey: GraphQLString,
			addFields: GQL_INPUT_TYPE_ADD_FIELDS,
			fields: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS),
			properties: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES)
		},
		resolve({args}) {
			return updateDocumentType(args);
		},
		type: GQL_TYPE_DOCUMENT_TYPE
	};
}
