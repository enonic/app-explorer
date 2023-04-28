import type {ParentPath} from '@enonic-types/lib-explorer';
import type {
	ApiKeyNode,
	ApiKeyNodeCreateParams
} from '../../../types/ApiKey';


import {
	NodeType,
	Path,
	Principal,
	ROOT_PERMISSIONS_EXPLORER
} from '@enonic/explorer-utils';
/*import {
	//forceArray,
	toStr
} from '@enonic/js-utils';*/
import {
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {getUser} from '/lib/xp/auth';

import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';

import {
	GQL_MUTATION_API_KEY_CREATE_NAME,
	GQL_TYPE_API_KEY_NAME
} from '../constants';
import {coerceApiKey} from './coerceApiKey';


export function addMutationApiKeyCreate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_API_KEY_CREATE_NAME,
		args: {
			_name: glue.getScalarType('_name'),
			collections: list(GraphQLString), // null allowed
			interfaces: list(GraphQLString), // null allowed
			key: nonNull(GraphQLString)
		},
		resolve(env :{
			args :{
				_name: string
				collections? :Array<string>
				interfaces? :Array<string>
				key :string
			}
		}) {
			//log.debug('env:%s', toStr(env));
			const {
				args: {
					_name,
					collections,
					interfaces,
					key
				}
			} = env;
			//log.debug('_name:%s', _name);
			//log.debug('collections:%s', toStr(collections));
			//log.debug('interfaces:%s', toStr(interfaces));
			//log.debug('key:%s', key);

			const apiKeyNodeToCreate :ApiKeyNodeCreateParams = {
				_indexConfig: {default: 'byType'},
				_inheritsPermissions: false, // false is the default and the fastest, since it doesn't have to read parent to apply permissions.
				_name,
				_nodeType: NodeType.API_KEY,
				_parentPath: Path.API_KEYS as ParentPath,
				_permissions: ROOT_PERMISSIONS_EXPLORER,
				collections, // No need to forceArray let Enonic XP do it's thing
				createdTime: new Date(),
				creator: getUser().key,
				interfaces, // No need to forceArray let Enonic XP do it's thing
				hashed: true,
				key: hash(key)
			};
			//log.debug('apiKeyNodeToCreate:%s', toStr(apiKeyNodeToCreate));

			const writeConnection = connect({
				principals: [Principal.EXPLORER_WRITE]
			});

			const createdApiKeyNode :ApiKeyNode = writeConnection.create(apiKeyNodeToCreate);
			//log.debug('createdApiKeyNode:%s', toStr(createdApiKeyNode));

			if (createdApiKeyNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
			} else {
				throw new Error(`Something went wrong when trying to create apiKey ${_name}`);
			}
			return coerceApiKey(createdApiKeyNode);
		},
		type: glue.getObjectType(GQL_TYPE_API_KEY_NAME)
	});
}
