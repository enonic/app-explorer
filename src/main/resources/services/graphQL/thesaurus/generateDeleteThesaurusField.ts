//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';

import {GQL_TYPE_NODE_DELETED_NAME} from '../constants';


export function generateDeleteThesaurusField({
	glue
}) {
	return {
		args: {
			_id: glue.getScalarType('_id')
		},
		resolve({
			args: {
				_id
			}
		}) {
			const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
			const array = writeConnection.delete(_id);
			if (!array.length === 1 ) {
				throw new Error(`Something went wrong while trying to delete thesaurus with id:${_id}!`);
			}
			writeConnection.refresh();
			return {
				_id: array[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	};
}
