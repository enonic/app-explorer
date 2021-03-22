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

export const queryApiKeys = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);

		const filters = {};
		const queryParams = {
			count: -1,
			filters: addFilter({
				filters,
				filter: hasValue('type', [NT_API_KEY])
			})
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
				hashed: node.hashed,
				key: node.key,
				type: node.type
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
					_path: { type: nonNull(GraphQLString) },
					_name: { type: nonNull(GraphQLString) },
					hashed: { type: nonNull(GraphQLBoolean) },
					key: { type: nonNull(GraphQLString) },
					type: { type: nonNull(GraphQLString) }
				}
			})) }
		} // fields
	})
};
