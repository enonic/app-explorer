import type {ApiKeyNode} from '../../../types/ApiKey';

import {
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';

import {
	NT_API_KEY,
	//PATH_API_KEYS,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_TYPE_API_KEY_NAME
} from '../constants';
import {coerceApiKey} from './coerceApiKey';


export function generateQueryApiKeysField({
	glue
}) {
	return {
		args: {
			count: GraphQLInt,
			sort: GraphQLString,
			start: GraphQLInt // start is ignored when count -1
		},
		resolve: (env :{
			args: {
				count? :number
				sort? :string
				start? :number
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			const {
				args: {
					count = -1,
					sort = '_name ASC',
					start = 0 // start is ignored when count -1
				} = {}
			} = env;
			//log.debug('count:%s', count);
			//log.debug('sort:%s', sort);
			//log.debug('start:%s', start); // start is ignored when count -1

			const queryParams = {
				count,
				filters: addQueryFilter({
					clause: 'must',
					filter: hasValue('_nodeType', [NT_API_KEY]),
					filters: {}
				}),
				query: '',
				sort,
				start // start is ignored when count -1
			};
			//log.debug('queryParams:%s', toStr(queryParams));

			const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

			const queryRes = readConnection.query(queryParams);
			//log.debug('queryRes:%s', toStr(queryRes));

			const queryApiKeys = {
				count: queryRes.count,
				hits: queryRes.hits.map(hit => {
					const node = readConnection.get(hit.id) as ApiKeyNode;
					return coerceApiKey(node);
				}),
				total: queryRes.total,
			};

			//log.debug('queryApiKeys:%s', toStr(queryApiKeys));
			return queryApiKeys;
		},
		type: glue.addObjectType({
			name: 'QueryApiKeys',
			fields: {
				total: { type: nonNull(GraphQLInt) },
				count: { type: nonNull(GraphQLInt) },
				hits: { type: list(glue.getObjectType(GQL_TYPE_API_KEY_NAME)) }
			} // fields
		})
	};
} // generateQueryApiKeysField
