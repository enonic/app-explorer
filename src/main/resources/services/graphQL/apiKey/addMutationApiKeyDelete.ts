import {
	//forceArray,
	toStr
} from '@enonic/js-utils';

import { Principal } from '@enonic/explorer-utils';
import {connect} from '/lib/explorer/repo/connect';

import {
	GQL_MUTATION_API_KEY_DELETE_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from '../constants';


export function addMutationApiKeyDelete({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_API_KEY_DELETE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
		},
		resolve(env :{
			args :{
				_id: string
			}
		}) {
			//log.debug('env:%s', toStr(env));
			const {
				args: {
					_id,
				}
			} = env;
			log.debug('_id:%s', _id);

			const writeConnection = connect({
				principals: [Principal.EXPLORER_WRITE]
			});

			const deleteApiKeyRes = writeConnection.delete(_id);
			log.debug('deleteApiKeyRes:%s', toStr(deleteApiKeyRes));

			if (deleteApiKeyRes.length !== 1 ) {
				throw new Error(`Something went wrong when trying to delete apiKey with id:${_id}`);
			}
			writeConnection.refresh(); // So the data becomes immidiately searchable
			return {
				_id: deleteApiKeyRes[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	});
}
