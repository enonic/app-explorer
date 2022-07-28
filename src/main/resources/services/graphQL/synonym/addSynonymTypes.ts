import type {Glue} from '../Glue';


import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
	GQL_TYPE_SYNONYM_NAME,
	GQL_TYPE_SYNONYM_QUERIED_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_BUCKET_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME
} from '../constants';


export function addSynonymTypes({
	glue
} :{
	glue :Glue
}) {
	const synonymLanguageSynonymInput = glue.addInputType({
		name: 'SynonymLanguageSynonymInput',
		fields: {
			comment: { type: GraphQLString },
			disabledInInterfaces: { type: list(GraphQLID) },
			enabled: { type: GraphQLBoolean },
			synonym: { type: nonNull(GraphQLString) }, // If this is null the SynonymLanguageSynonymInput object should not exist!
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
		fields: {
			// Required
			locale: { type: nonNull(GraphQLString) },
			// Optional
			both: { type: list(synonymLanguageSynonymInput)},
			comment: { type: GraphQLString },
			disabledInInterfaces: { type: list(GraphQLID) },
			enabled: { type: GraphQLBoolean },
			from: { type: list(synonymLanguageSynonymInput)},
			to: { type: list(synonymLanguageSynonymInput)}
		}
	});

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const synonymLanguageSynonym = glue.addObjectType({
		name: 'SynonymLanguageSynonym',
		fields: {
			comment: { type: GraphQLString },
			disabledInInterfaces: { type: list(GraphQLID) },
			enabled: { type: GraphQLBoolean },
			synonym: { type: nonNull(GraphQLString) }, // If this is null the SynonymLanguageSynonym object should not exist!
		}
	});

	const synonymFields = {
		...interfaceNodeFields,
		comment: { type: GraphQLString },
		disabledInInterfaces: { type: list(GraphQLID) },
		enabled: { type: GraphQLBoolean },
		languages: { type: list(glue.addObjectType({
			name: 'SynonymLanguage',
			fields: {
				// Required
				locale: { type: nonNull(GraphQLString) },
				// Optional
				both: { type: list(synonymLanguageSynonym)},
				comment: { type: GraphQLString },
				disabledInInterfaces: { type: list(GraphQLID) },
				enabled: { type: GraphQLBoolean },
				from: { type: list(synonymLanguageSynonym)},
				to: { type: list(synonymLanguageSynonym)}
			}
		}))},
		thesaurus: { type: nonNull(GraphQLString) }, // NOTE: Added from path by forceTypeSynonym
		thesaurusReference: { type: glue.getScalarType('_id') },
	}

	glue.addObjectType({
		name: GQL_TYPE_SYNONYM_NAME,
		fields: synonymFields,
		//interfaces: [interfaceNodeType]
	})

	const gqlTypeSynonymQueried = glue.addObjectType({
		name: GQL_TYPE_SYNONYM_QUERIED_NAME,
		fields: {
			...synonymFields,
			//_highlight: { type: } // TODO
			_score: { type: GraphQLFloat }, // NOTE: Only when quering
		},
		interfaces: [interfaceNodeType]
	});

	glue.addObjectType({
		name: GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME,
		fields: {
			aggregations: { type: glue.addObjectType({
				name: GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_NAME,
				fields: {
					thesaurus: { type: glue.addObjectType({
						name: GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_NAME,
						fields: {
							buckets: { type: list(glue.addObjectType({
								name: GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_BUCKET_NAME,
								fields: {
									key: { type: nonNull(GraphQLString) },
									docCount: { type: nonNull(GraphQLInt) }
								}
							})) }
						}
					}) }
				}
			}) },
			count: { type: nonNull(GraphQLInt) },
			end: { type: nonNull(GraphQLInt) },
			hits: { type: list(gqlTypeSynonymQueried) },
			page: { type: nonNull(GraphQLInt) },
			start: { type: nonNull(GraphQLInt) },
			total: { type: nonNull(GraphQLInt) },
			totalPages: { type: nonNull(GraphQLInt) }
		} // fields
	});
}
