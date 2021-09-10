import {GQL_TYPE_ID} from '../types';
import {getDocumentType} from './getDocumentType';
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
