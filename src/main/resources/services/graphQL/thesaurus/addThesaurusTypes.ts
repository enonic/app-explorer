import {
	GraphQLInt,
	GraphQLString,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_SYNONYM_NAME,
	GQL_TYPE_THESAURI_QUERY_HITS,
	GQL_TYPE_THESAURI_QUERY_RESULT,
	GQL_TYPE_THESAURUS_NAME
} from '../constants';


export function addThesaurusTypes({
	glue
}) {
	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const thesaurusNodeFields = {
		allowedLanguages: { type: list(GraphQLString) },
		description: { type: nonNull(GraphQLString) }
	}

	glue.addObjectType({
		name: GQL_TYPE_THESAURUS_NAME,
		fields: {
			...interfaceNodeFields,
			...thesaurusNodeFields
		},
		interfaces: [interfaceNodeType]
	});
	glue.addObjectType({
		name: GQL_TYPE_THESAURI_QUERY_RESULT,
		//description:
		fields: {
			count: { type: glue.getScalarType('count') },
			hits: { type: list(glue.addObjectType({
				name: GQL_TYPE_THESAURI_QUERY_HITS,
				//description:
				fields: {
					...interfaceNodeFields,
					...thesaurusNodeFields,
					synonyms: { type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME) },
					synonymsCount: { type: nonNull(GraphQLInt) }
				}
			}))},
			total: { type: glue.getScalarType('total') }
		} // fields
	});
} // generateThesaurusTypes
