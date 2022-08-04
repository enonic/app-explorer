import type {Glue} from '../Glue';


import {
	GraphQLID,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {submitTask} from '/lib/xp/task';


export function addMutationMigrateThesaurusSynonyms_v1_to_v2({
	glue
} :{
	glue: Glue
}) {
	glue.addMutation<{
		fromLocale :string
		thesaurusId :string
		toLocale :string
	}>({
		name: 'migrateThesaurusSynonyms_v1_to_v2',
		args: {
			fromLocale: nonNull(GraphQLString),
			thesaurusId: nonNull(GraphQLID),
			toLocale: nonNull(GraphQLString)
		},
		resolve({
			args: {
				fromLocale,
				thesaurusId,
				toLocale
			}
		}) {
			return {
				taskId: submitTask({
					descriptor: 'migrate_thesaurus_synonyms_v1_to_v2',
					config: {
						fromLocale,
						thesaurusId,
						toLocale
					}
				})
			};
		},
		type: glue.addObjectType({
			name: 'SubmittedTask',
			fields: {
				taskId: { type: nonNull(GraphQLID) }
			}
		})
	});
}
