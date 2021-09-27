import {
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';


export function generateDeleteDocumentTypeField({
	GQL_TYPE_ID,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	return {
		args: {
			_id: GQL_TYPE_ID
		},
		resolve({
			args: {
				_id
			}
		}) {
			const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
			const array = writeConnection.delete(_id);
			if (!array.length === 1 ) {
				throw new Error(`Something went wrong while trying to delete documentType with id:${_id}!`);
			}
			return {
				_id: array[0]
			};
		},
		type: createObjectType({
			name: 'DeletedDocumentType',
			fields: {
				_id: { type: GQL_TYPE_ID }
			}
		})
	};
}
