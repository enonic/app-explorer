import {getDocumentType} from '/lib/explorer/documentType/getDocumentType';

import {GQL_TYPE_DOCUMENT_TYPE_NAME} from '../constants';


export function generateGetDocumentTypeField({
	glue
}) {
	return {
		args: {
			_id: glue.getScalarType('_id')
		},
		resolve: ({
			args: {
				_id
			}
		}) => getDocumentType({_id}),
		type: glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_NAME)
	};
}
