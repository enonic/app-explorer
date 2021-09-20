import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {list} from '/lib/graphql';

import {GQL_TYPE_NAME} from '../types';
import {
	GQL_INPUT_TYPE_ADD_FIELDS,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
	GQL_TYPE_DOCUMENT_TYPE
} from './types';



export const fieldDocumentTypeCreate = {
	args: {
		_name: GQL_TYPE_NAME,
		addFields: GQL_INPUT_TYPE_ADD_FIELDS,
		fields: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS),
		properties: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES)
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
	type: GQL_TYPE_DOCUMENT_TYPE
}; // fieldDocumentTypeCreate
