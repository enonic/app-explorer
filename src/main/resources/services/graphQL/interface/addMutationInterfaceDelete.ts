import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';

import {
	GQL_MUTATION_INTERFACE_DELETE_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from '../constants';


export function addMutationInterfaceDelete({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_INTERFACE_DELETE_NAME,
		args: {
			_id: glue.getScalarType('_id')
		},
		resolve(env :{
			args :{
				_id :string
			}
		}) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_id
				}
			} = env;
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});
			const array = writeConnection.delete(_id);
			if (array.length !== 1 ) {
				throw new Error(`Something went wrong while trying to delete interface with id:${_id}!`);
			}
			writeConnection.refresh(); // Fix #821 Deleting an interface causes white page
			return {
				_id: array[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	});
}
