
import type {CollectionNode} from '/lib/explorer/types/Collection.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {
	CamelToFieldObj,
	SearchConnectionResolverEnv,
	SearchResolverEnv
} from './types.d';
import type {Glue} from './Glue';


import {
	GraphQLInt,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {decodeCursor} from '/lib/graphql-connection';

import {
	GQL_INPUT_TYPE_AGGREGATION,
	GQL_INPUT_TYPE_FILTERS,
	GQL_INPUT_TYPE_HIGHLIGHT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION
} from './constants';
import {doQuery} from './doQuery';


export function buildSchema({
	camelToFieldObj,
	collections,
	collectionIdToDocumentTypeId,
	glue,
	documentTypeIdToName,
	fields,
	stopWords
} :{
	camelToFieldObj :CamelToFieldObj
	collections :Array<CollectionNode>
	collectionIdToDocumentTypeId :{
		[k :string] :string
	}
	documentTypeIdToName :{
		[k :string] :string
	}
	fields :Array<InterfaceField>
	glue :Glue
	stopWords :Array<string>
}) {
	function searchResolver(env :SearchResolverEnv) {
		return doQuery({
			camelToFieldObj,
			collections,
			collectionIdToDocumentTypeId,
			env,
			documentTypeIdToName,
			fields,
			stopWords
		});
	} // searchResolver

	const inputTypeAggregation = glue.getInputType(GQL_INPUT_TYPE_AGGREGATION);
	const inputTypeFilters = glue.getInputType(GQL_INPUT_TYPE_FILTERS);
	const inputTypeHighlight = glue.getInputType(GQL_INPUT_TYPE_HIGHLIGHT);

	glue.addQueryField({
		args: {
			after: GraphQLString,
			aggregations: list(inputTypeAggregation),
			filters: inputTypeFilters,
			first: GraphQLInt,
			highlight: inputTypeHighlight,
			searchString: GraphQLString
		},
		name: 'getSearchConnection',
		resolve(env :SearchConnectionResolverEnv) {
			//log.debug(`env:${toStr({env})}`);
			const {
				after,// = encodeCursor('0'), // encoded representation of start
				aggregations,
				filters,
				first = 10, // count
				highlight,
				searchString
			} = env.args;
			//log.debug(`after:${toStr({after})}`);
			//log.debug(`first:${toStr({first})}`);
			const start = after ? parseInt(decodeCursor(after)) + 1 : 0;
			//log.debug(`start:${toStr({start})}`);
			const res = searchResolver({
				args: {
					aggregations,
					count: first,
					filters,
					highlight,
					searchString,
					start
				}
			});
			//log.debug(`res:${toStr({res})}`);
			//res.start = start; // TODO Do I use this for anything?
			//log.debug(`res:${toStr({res})}`);
			return res;
		},
		//type: createConnectionType(schemaGenerator, objectTypeInterfaceSearch)
		type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION)
	});

	glue.addQueryField({
		args: {
			aggregations: list(inputTypeAggregation),
			count: GraphQLInt,
			filters: inputTypeFilters,
			highlight: inputTypeHighlight,
			searchString: GraphQLString,
			start: GraphQLInt
		},
		name: 'search',
		resolve: (env :SearchResolverEnv) => searchResolver(env),
		type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH)
	});

	return glue.buildSchema();
}
