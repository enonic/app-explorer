import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {
	GQL_TYPE_SYNONYM_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME
} from '../constants';


export function generateSynonymTypes({
	glue
}) {
	const GQL_TYPE_FROM = list(GraphQLString);
	const GQL_TYPE_TO = list(GraphQLString);
	glue.addObjectType({
		name: GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME,
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(glue.addObjectType({
				name: GQL_TYPE_SYNONYM_NAME,
				fields: {
					//_highlight: { type: } // TODO
					_id: { type: glue.getScalarType('_id') },
					//id: { type: GraphQLString }, // NOTE Removed backwards compatibility
					//_name: { type: GQL_TYPE_NAME }, // Name is random and useless...
					_nodeType: { type: glue.getScalarType('_nodeType') }, // Could use enum
					_path: { type: glue.getScalarType('_path') },
					_score: { type: GraphQLFloat }, // NOTE: Only when quering
					//displayName: { type: nonNull(GraphQLString) }, // TODO We want to remove displayName
					from: { type: GQL_TYPE_FROM },
					//name: { type: GQL_TYPE_NAME }, // NOTE Removed backwards compatibility
					//score: { type: GraphQLFloat }, // NOTE: Removed backwards compatibility
					thesaurus: { type: nonNull(GraphQLString) }, // NOTE: Added from path by forceTypeSynonym
					thesaurusReference: { type: glue.getScalarType('_id') },
					to: { type: GQL_TYPE_TO }//,
					//type: { type: GQL_TYPE_NODE_TYPE } // NOTE Removed backwards compatibility
				}
			})) }
		} // fields
	});
	return {
		GQL_TYPE_FROM,
		GQL_TYPE_TO
	};
}
