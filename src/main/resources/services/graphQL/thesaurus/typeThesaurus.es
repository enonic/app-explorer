import {
	GraphQLString,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {typeThesaurusLanguage} from './typeThesaurusLanguage';

const {
	createObjectType
} = newSchemaGenerator();


export const typeThesaurus = createObjectType({
	name: 'Thesaurus',
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString },
		_path: { type: nonNull(GraphQLString) },
		language: { type: typeThesaurusLanguage }
	}
});
