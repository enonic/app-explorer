import type {
	SearchConnectionResolverEnv,
	SearchResolverEnv,
	SearchResolverReturnType
} from './index.d';


//import {toStr} from '@enonic/js-utils';
//@ts-ignore
import {newCache} from '/lib/cache';
import {
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	list
	//@ts-ignore
} from '/lib/graphql';
import {
	decodeCursor//,
	//encodeCursor // Just use to generate after for testing
	//@ts-ignore
} from '/lib/graphql-connection';
import {constructGlue} from '../utils/Glue';
import {addAggregationInput} from '../aggregations/guillotine/input/addAggregationInput';
import {addFilterInput} from '../filters/guillotine/input/addFilterInput';
import {addInputTypeHighlight} from '../highlight/input/addInputTypeHighlight';
import {searchResolver} from './searchResolver';
import {addObjectTypeSearchConnection} from './output/addObjectTypeSearchConnection';
import {addObjectTypeSearchResult} from './output/addObjectTypeSearchResult';


const SECONDS_TO_CACHE = 10;

const schemaCache = newCache({
	size: 1,
	expire: SECONDS_TO_CACHE
});

const schemaGenerator = newSchemaGenerator();


export function makeSchema() {
	return schemaCache.get('static-key', () => {
		//log.debug('caching a new schema for %s seconds', SECONDS_TO_CACHE);

		const glue = constructGlue({schemaGenerator});

		const commonGQLInputFields = {
			aggregations: list(addAggregationInput({glue})),
			filters: list(addFilterInput({glue})),
			highlight: addInputTypeHighlight({glue}),
			searchString: GraphQLString,
		}

		glue.addQueryField<SearchConnectionResolverEnv, SearchResolverReturnType>({
			args: {
				...commonGQLInputFields,
				after: GraphQLString,
				first: GraphQLInt,
			},
			name: 'getSearchConnection',
			resolve(env) {
				//log.debug(`env:${toStr({env})}`);
				const {
					after,// = encodeCursor('0'), // encoded representation of start
					aggregations,
					filters,
					first = 10, // count
					highlight,
					searchString
				} = env.args;
				//log.debug('after:%s', toStr(after));
				//log.debug('first:%s', toStr(first));
				//log.debug("encodeCursor('0'):%s", toStr(encodeCursor('0'))); // MA==
				//log.debug("encodeCursor('1'):%s", toStr(encodeCursor('1'))); // MQ==
				//log.debug("encodeCursor('2'):%s", toStr(encodeCursor('2'))); // Mg==

				const start = after ? parseInt(decodeCursor(after)) + 1 : 0;
				//log.debug('start:%s', toStr(start));

				const res = searchResolver({
					args: {
						aggregations,
						count: first,
						filters,
						highlight,
						searchString,
						start
					},
					context: env.context
				});
				return res;
			},
			type: addObjectTypeSearchConnection({glue})
		});

		glue.addQueryField<SearchResolverEnv, SearchResolverReturnType>({
			args: { // GraphQL input types
				...commonGQLInputFields,
				count: GraphQLInt,
				start: GraphQLInt
			},
			name: 'search',
			resolve: (env) => searchResolver(env),
			type: addObjectTypeSearchResult({glue})
		}); // addQueryField search

		return glue.buildSchema();
	}); // schemaCache.get
} // makeSchema
