import {getDocumentType} from '/lib/explorer/documentType/getDocumentType';

import {GQL_TYPE_ID} from '../types';
import {GQL_TYPE_DOCUMENT_TYPE} from './types';


export const fieldDocumentTypeGet = {
	args: {
		_id: GQL_TYPE_ID
	},
	resolve: ({
		args: {
			_id
		}
	}) => getDocumentType({_id}),
	type: GQL_TYPE_DOCUMENT_TYPE
}; // fieldDocumentTypeGet
