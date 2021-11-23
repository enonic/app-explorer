
import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	Json as GraphQLJson,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {
	//createConnectionType,
	//decodeCursor,
	encodeCursor
} from '/lib/graphql-connection';

import {
	//GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_EDGE,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION_PAGE_INFO,
	//GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT,
	GQL_UNION_TYPE_DOCUMENT_TYPES
} from './constants';


export function addDynamicObjectTypes({
	glue,
	interfaceSearchHitsFieldsFromSchema,
	interfaceSearchHitsHighlightsFields
}) {
	const interfaceSearchHitsFields = {
		_collectionId: { type: nonNull(GraphQLID) },
		_collectionName: { type: nonNull(GraphQLString) },
		_documentTypeId: { type: nonNull(GraphQLString) },
		_documentTypeName: { type: nonNull(GraphQLString) },
		_highlight: { type: glue.addObjectType({
			name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT,
			fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
		})},
		_json: { type: GraphQLJson },
		_repoId: { type: nonNull(GraphQLString) },
		_score: { type: GraphQLFloat }
	};
	//log.debug(`Object.keys(interfaceSearchHitsFieldsFromSchema):${toStr(Object.keys(interfaceSearchHitsFieldsFromSchema))}`);
	Object.keys(interfaceSearchHitsFieldsFromSchema).forEach((k) => {
		interfaceSearchHitsFields[k] = interfaceSearchHitsFieldsFromSchema[k];
	});

	/*const objectTypeInterfaceSearchHit = glue.addObjectType({
		name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT,
		fields: interfaceSearchHitsFields
	});*/
	//const objectTypeInterfaceSearchHit = glue.getUnionType(GQL_INTERFACE_TYPE_DOCUMENT); // Error: name:Document is not an unionType! but interfaceType
	const objectTypeInterfaceSearchHit = glue.getUnionType(GQL_UNION_TYPE_DOCUMENT_TYPES);

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
				type: list(glue.addObjectType({
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
				}))
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
				type: glue.addObjectType({
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
				})
			},
			aggregations: { type: list(GQL_OBJECT_TYPE_AGGREGATIONS_UNION) },
			aggregationsAsJson: { type: GraphQLJson }
		}
	});
}
