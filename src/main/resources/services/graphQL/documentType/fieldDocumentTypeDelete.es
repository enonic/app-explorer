import {
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	newSchemaGenerator
} from '/lib/graphql';

import {GQL_TYPE_ID} from '../types';


const {
	createObjectType
} = newSchemaGenerator();


export const fieldDocumentTypeDelete = {
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
}; // fieldDocumentTypeDelete
