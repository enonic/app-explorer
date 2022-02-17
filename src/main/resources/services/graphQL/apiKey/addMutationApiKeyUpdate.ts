import type {ApiKeyNodeUpdated} from '../../../types/ApiKey';

//import {toStr} from '@enonic/js-utils';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {getUser} from '/lib/xp/auth';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';

import {
	GQL_MUTATION_API_KEY_UPDATE_NAME,
	GQL_TYPE_API_KEY_NAME
} from '../constants';
import {coerceApiKey} from './coerceApiKey';


export function addMutationApiKeyUpdate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_API_KEY_UPDATE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
			//_name: glue.getScalarType('_name'),
			collections: list(GraphQLString), // null allowed
			interfaces: list(GraphQLString), // null allowed
			key: GraphQLString // Nullable
		},
		resolve(env :{
			args :{
				_id: string
				//_name: string
				collections? :Array<string>
				interfaces? :Array<string>
				key? :string
			}
		}) {
			//log.debug('env:%s', toStr(env));
			const {
				args: {
					_id,
					//_name,
					collections,
					interfaces,
					key
				}
			} = env;
			//log.debug('_id:%s', _id);
			//log.debug('_name:%s', _name);
			//log.debug('collections:%s', toStr(collections));
			//log.debug('interfaces:%s', toStr(interfaces));
			//log.debug('key:%s', key);

			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});

			const updatedApiKeyNode :ApiKeyNodeUpdated = writeConnection.modify({
				key: _id,
				editor: (apiKeyNode :ApiKeyNodeUpdated) => {
					apiKeyNode.collections = collections;
					apiKeyNode.interfaces = interfaces;
					apiKeyNode.modifiedTime = new Date();
					apiKeyNode.modifier = getUser().key;
					if (key) {
						apiKeyNode.key = hash(key);
					}
					return apiKeyNode;// as ApiKeyNodeUpdated;
				}
			});
			//log.debug('updatedApiKeyNode:%s', toStr(updatedApiKeyNode));

			if (updatedApiKeyNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
			} else {
				throw new Error(`Something went wrong when trying to update apiKey ${_id}`);
			}
			return coerceApiKey(updatedApiKeyNode);
		},
		type: glue.getObjectType(GQL_TYPE_API_KEY_NAME)
	});
}
