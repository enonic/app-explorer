import {
	GraphQLString,
	nonNull
} from '/lib/graphql';


export function generateThesaurusTypes({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
}) {
	const {
		createInputObjectType,
		createObjectType
	} = schemaGenerator;
	const GQL_TYPE_THESAURUS_LANGUAGE = createObjectType({
		name: 'ThesaurusLanguage',
		fields: {
			from: { type: nonNull(GraphQLString)},
			to: { type: nonNull(GraphQLString)}
		}
	});
	return {
		GQL_INPUT_TYPE_THESAURUS_LANGUAGE: createInputObjectType({
			name: 'ThesaurusLanguageInput',
			fields: {
				from: { type: nonNull(GraphQLString)},
				to: { type: nonNull(GraphQLString)}
			}
		}),
		GQL_TYPE_THESAURUS: createObjectType({
			name: 'Thesaurus',
			fields: {
				_id: { type: GQL_TYPE_ID },
				_name: { type: GQL_TYPE_NAME },
				_nodeType: { type: GraphQLString },
				_path: { type: GQL_TYPE_PATH },
				language: { type: GQL_TYPE_THESAURUS_LANGUAGE }
			}
		}),
		GQL_TYPE_THESAURUS_LANGUAGE
	};
} // generateThesaurusTypes
