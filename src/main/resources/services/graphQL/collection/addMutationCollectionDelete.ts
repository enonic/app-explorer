import {
	//forceArray,
	toStr
} from '@enonic/js-utils';
import {
	NodeType,
	Principal
} from '@enonic/explorer-utils';
import { connect } from '/lib/explorer/repo/connect';
import {
	GQL_MUTATION_COLLECTION_DELETE_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from '../constants';


export default function addMutationCollectionDelete({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_COLLECTION_DELETE_NAME,
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

			const collectionNode = writeConnection.get(_id);

			if (!collectionNode) {
				throw new Error(`Unable to get collection with id:${_id}`);
			}

			if (collectionNode._nodeType !== NodeType.COLLECTION) {
				throw new Error(`id:${_id} not a collection!`);
			}

			const deleteCollectionRes = writeConnection.delete(_id);
			log.debug('deleteCollectionRes:%s', toStr(deleteCollectionRes));

			if (deleteCollectionRes.length !== 1 ) {
				throw new Error(`Something went wrong when trying to delete collection with id:${_id}`);
			}
			writeConnection.refresh(); // So the data becomes immidiately searchable
			return {
				_id: deleteCollectionRes[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	});
}
