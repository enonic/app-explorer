import {
	GraphQLString,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

const {
	createInputObjectType
} = newSchemaGenerator();


export const inputTypeThesaurusLanguage = createInputObjectType({
	name: 'ThesaurusLanguageInput',
	fields: {
		from: { type: nonNull(GraphQLString)},
		to: { type: nonNull(GraphQLString)}
	}
});
