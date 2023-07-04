//import {toStr} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GQL_MUTATION_STOP_WORDS_DELETE_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from '../constants';


export function addStopWordsDelete({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_STOP_WORDS_DELETE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
		},
		resolve(env :{
			args :{
				_id: string
			}
		}) {
			const {
				args: {
					_id,
				}
			} = env;
			const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
			const deleteStopwordsRes = writeConnection.delete(_id);
			//log.debug('deleteStopwordsRes:%s', toStr(deleteStopwordsRes));

			if (deleteStopwordsRes.length !== 1 ) {
				throw new Error(`Something went wrong when trying to delete apiKey with id:${_id}`);
			}
			writeConnection.refresh(); // So the data becomes immidiately searchable
			return {
				_id: deleteStopwordsRes[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	});
}
