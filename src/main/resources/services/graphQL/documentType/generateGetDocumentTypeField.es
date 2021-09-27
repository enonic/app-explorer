import {getDocumentType} from '/lib/explorer/documentType/getDocumentType';


export function generateGetDocumentTypeField({
	GQL_TYPE_DOCUMENT_TYPE,
	GQL_TYPE_ID
}) {
	return {
		args: {
			_id: GQL_TYPE_ID
		},
		resolve: ({
			args: {
				_id
			}
		}) => getDocumentType({_id}),
		type: GQL_TYPE_DOCUMENT_TYPE
	};
}
