import type {Glue} from '../../utils/Glue';


import {
	Json as GraphQLJson,
	GraphQLFloat,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';


export function addOutputFieldsSearchResultHit({glue} :{glue :Glue}) {
	return glue.addOutputFields({
		name: 'SearchResultHitFields',
		fields: {
			_collection: { type: nonNull(GraphQLString) },
			_createdTime: { type: GraphQLString }, // TODO nonNull?
			_documentType: { type: GraphQLString }, // Nullable
			_json: { type: nonNull(GraphQLJson) },
			_highlight: { type: GraphQLJson }, // Nullable
			_modifiedTime: { type: GraphQLString }, // Nullable
			_score: { type: nonNull(GraphQLFloat) }
		}
	});
}
