import type {Glue} from '../../utils/Glue';


import {
	Json as GraphQLJson,
	GraphQLFloat,
	GraphQLString,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';


export function addObjectTypeSearchResultHit({glue} :{glue :Glue}) {
	return glue.addObjectType({
		name: 'SearchResultHit',
		fields: {
			_collection: { type: nonNull(GraphQLString) },
			_createdTime: { type: GraphQLString },
			_documentType: { type: GraphQLString },
			_json: { type: nonNull(GraphQLJson) },
			_highlight: { type: list(glue.addObjectType({
				name: 'SearchResultHitHighlight',
				fields: {
					fieldPath: { type: GraphQLString },
					highlights: { type: list(GraphQLString) }
				}
			}))},
			_modifiedTime: { type: GraphQLString },
			_score: { type: nonNull(GraphQLFloat) }
		}});
}
