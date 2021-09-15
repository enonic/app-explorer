import {list} from '/lib/graphql';

import {GQL_TYPE_NAME} from '../types';
import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
	GQL_TYPE_DOCUMENT_TYPE_CREATE
} from './types';

import {createDocumentType} from './createDocumentType';


export const fieldDocumentTypeCreate = {
	args: {
		_name: GQL_TYPE_NAME,
		properties: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES)
	},
	resolve({
		args: {
			_name,
			properties = []
		}
	}) {
		return createDocumentType({_name, properties});
	}, // resolve
	type: GQL_TYPE_DOCUMENT_TYPE_CREATE
}; // fieldDocumentTypeCreate
