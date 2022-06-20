import type {Glue} from '../../utils/Glue';


//import {toStr} from '@enonic/js-utils';
import {
	GraphQLBoolean,
	GraphQLInt,
	Json as GraphQLJson,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {encodeCursor} from '/lib/graphql-connection';

import {
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_EDGE,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_PAGE_INFO
} from '../constants';


export function addDynamicObjectTypes({
	glue
} :{
	glue :Glue
}) {
	const objectTypeInterfaceSearchHit = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);

	const GQL_OBJECT_TYPE_AGGREGATIONS_UNION = glue.getUnionType(GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME);

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_INTERFACE_SEARCH,
		fields: {
			aggregations: { type: list(GQL_OBJECT_TYPE_AGGREGATIONS_UNION) },
			aggregationsAsJson: { type: GraphQLJson },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(objectTypeInterfaceSearchHit)},
			total: { type: nonNull(GraphQLInt) }
		}
	});

	const edgeType = glue.addObjectType({
		name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_EDGE,
		fields: {
			cursor: {
				type: nonNull(GraphQLString),
				resolve(env) {
					//log.debug(`cursor env:${toStr({env})}`);
					return env.source.cursor;
				}
			},
			node: {
				type: objectTypeInterfaceSearchHit,
				resolve(env) {
					//log.debug(`node env:${toStr({env})}`);
					return env.source.node;
				}
			}
		}
	});

	const pageInfoType = glue.addObjectType({
		name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_PAGE_INFO,
		fields: {
			endCursor: {
				type: nonNull(GraphQLString),
				resolve: (env) => encodeCursor(env.source.endCursor)
			},
			hasNext: {
				type: nonNull(GraphQLBoolean),
				resolve: (env) => env.source.hasNext
			},
			startCursor: {
				type: nonNull(GraphQLString),
				resolve: (env) => encodeCursor(env.source.startCursor)
			}
		}
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION,
		fields: {
			totalCount: {
				resolve: (env) => env.source.total,
				type: nonNull(GraphQLInt)
			},
			edges: {
				resolve(env) {
					//log.debug(`edges env:${toStr({env})}`);
					let hits = env.source.hits;
					let edges = [];
					for (let i = 0; i < hits.length; i++) {
						edges.push({
							node: hits[i],
							cursor: env.source.start + i
						});
					}
					//log.debug(`edges:${toStr({edges})}`);
					return edges;
				},
				type: list(edgeType)
			},
			pageInfo: {
				resolve(env) {
					let count = env.source.hits.length;
					return {
						startCursor: env.source.start,
						endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
						hasNext: (env.source.start + count) < env.source.total
					};
				},
				type: pageInfoType
			},
			aggregations: { type: list(GQL_OBJECT_TYPE_AGGREGATIONS_UNION) },
			aggregationsAsJson: { type: GraphQLJson }
		}
	});
}
