import {
	GraphQLString,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

const {
	createObjectType
} = newSchemaGenerator();


export const typeThesaurusLanguage = createObjectType({
	name: 'ThesaurusLanguage',
	fields: {
		from: { type: nonNull(GraphQLString)},
		to: { type: nonNull(GraphQLString)}
	}
});
