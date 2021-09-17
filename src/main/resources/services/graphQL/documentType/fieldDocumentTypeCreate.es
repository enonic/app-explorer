import {list} from '/lib/graphql';

import {GQL_TYPE_NAME} from '../types';
import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
	GQL_TYPE_DOCUMENT_TYPE
} from './types';

import {createDocumentType} from './createDocumentType';


export const fieldDocumentTypeCreate = {
	args: {
		_name: GQL_TYPE_NAME,
		fields: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS),
		properties: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES)
	},
	resolve({
		args: {
			_name,
			fields = [],
			properties = []
		}
	}) {
		return createDocumentType({_name, fields, properties});
	}, // resolve
	type: GQL_TYPE_DOCUMENT_TYPE
}; // fieldDocumentTypeCreate
