import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_SYNONYM_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME
} from '../constants';


export function generateSynonymTypes({
	glue
}) {
	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const GQL_TYPE_FROM = list(GraphQLString);
	const GQL_TYPE_TO = list(GraphQLString);
	glue.addObjectType({
		name: GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME,
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(glue.addObjectType({
				name: GQL_TYPE_SYNONYM_NAME,
				fields: {
					...interfaceNodeFields,
					//_highlight: { type: } // TODO
					_score: { type: GraphQLFloat }, // NOTE: Only when quering
					//displayName: { type: nonNull(GraphQLString) }, // TODO We want to remove displayName
					from: { type: GQL_TYPE_FROM },
					thesaurus: { type: nonNull(GraphQLString) }, // NOTE: Added from path by forceTypeSynonym
					thesaurusReference: { type: glue.getScalarType('_id') },
					to: { type: GQL_TYPE_TO }
				},
				interfaces: [interfaceNodeType]
			})) }
		} // fields
	});
	return {
		GQL_TYPE_FROM,
		GQL_TYPE_TO
	};
}
