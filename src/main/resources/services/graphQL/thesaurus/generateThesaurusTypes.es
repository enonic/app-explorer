import {
	GraphQLInt,
	GraphQLString,
	nonNull,
	list
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_SYNONYM_NAME,
	GQL_TYPE_THESAURI_QUERY_HITS,
	GQL_TYPE_THESAURI_QUERY_RESULT,
	GQL_TYPE_THESAURUS_LANGUAGE_NAME,
	GQL_TYPE_THESAURUS_NAME
} from '../constants';


export function generateThesaurusTypes({
	glue
}) {
	glue.addInputType({
		name: GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME,
		fields: {
			from: { type: nonNull(GraphQLString)},
			to: { type: nonNull(GraphQLString)}
		}
	});

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	glue.addObjectType({
		name: GQL_TYPE_THESAURUS_NAME,
		fields: {
			...interfaceNodeFields,
			language: { type: glue.addObjectType({
				name: GQL_TYPE_THESAURUS_LANGUAGE_NAME,
				fields: {
					from: { type: nonNull(GraphQLString)},
					to: { type: nonNull(GraphQLString)}
				}
			})}
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
					_id: { type: glue.getScalarType('_id') },
					_name: { type: glue.getScalarType('_name') },
					_nodeType: { type: GraphQLString }, // TODO nonNull?
					_path: { type: glue.getScalarType('_path') },
					description: { type: nonNull(GraphQLString) },
					//displayName: { type: nonNull(GraphQLString) },
					language: { type: glue.getObjectType(GQL_TYPE_THESAURUS_LANGUAGE_NAME) },
					synonyms: { type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME) },
					synonymsCount: { type: nonNull(GraphQLInt) }//,
					//type: { type: nonNull(GraphQLString) }
				}
			}))},
			total: { type: glue.getScalarType('total') }
		} // fields
	});
} // generateThesaurusTypes
