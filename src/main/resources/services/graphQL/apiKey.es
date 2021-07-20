import {
	NT_API_KEY,
	//PATH_API_KEYS,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';

export const queryApiKeys = {
	args: {
		count: GraphQLInt,
		sort: GraphQLString,
		start: GraphQLInt // start is ignored when count -1
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		const {
			args: {
				count = -1,
				sort = '_name ASC',
				start = 0 // start is ignored when count -1
			} = {}
		} = env;
		//log.info(`count:${count}`);
		//log.info(`sort:${sort}`);
		//log.info(`start:${start}`); // start is ignored when count -1

		const queryParams = {
			count,
			filters: addFilter({
				filter: hasValue('_nodeType', [NT_API_KEY])
			}),
			sort,
			start // start is ignored when count -1
		};
		//log.info(`queryParams:${toStr(queryParams)}`);

		const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

		const apiKeysRes = readConnection.query(queryParams);
		//log.info(`apiKeysRes:${toStr(apiKeysRes)}`);

		apiKeysRes.hits = apiKeysRes.hits.map(hit => {
			const node = readConnection.get(hit.id);
			return { // whitelist :)
				_id: node._id,
				_path: node._path,
				_name: node._name,
				_nodeType: node._nodeType,
				collections: forceArray(node.collections),
				hashed: node.hashed,
				key: node.key//,
				//type: node.type
			};
		});
		//log.info(`apiKeysRes:${toStr(apiKeysRes)}`);

		return apiKeysRes;
	},
	type: createObjectType({
		name: 'QueryApiKeys',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(createObjectType({
				name: 'ApiKey',
				fields: {
					_id: { type: nonNull(GraphQLString) },
					_name: { type: nonNull(GraphQLString) },
					_nodeType: { type: GraphQLString }, // TODO nonNull?
					_path: { type: nonNull(GraphQLString) },
					collections: { type: list(GraphQLString)},
					hashed: { type: nonNull(GraphQLBoolean) },
					key: { type: nonNull(GraphQLString) }//,
					//type: { type: nonNull(GraphQLString) }
				}
			})) }
		} // fields
	})
};
