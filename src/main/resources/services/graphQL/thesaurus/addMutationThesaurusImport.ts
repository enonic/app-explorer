import type {Glue} from '../Glue';


import {
	GraphQLID,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {submitTask} from '/lib/xp/task';
import {
	GQL_MUTATION_THESAURUS_IMPORT_NAME,
	GQL_TYPE_TASK_SUBMITTED
} from '../constants';


export function addMutationThesaurusImport({
	glue
} :{
	glue: Glue
}) {
	glue.addMutation<{
		csv :string
		fromLocale :string
		thesaurusId :string
		toLocale :string
	}>({
		name: GQL_MUTATION_THESAURUS_IMPORT_NAME,
		args: {
			csv: nonNull(GraphQLString),
			fromLocale: nonNull(GraphQLString),
			thesaurusId: nonNull(GraphQLID),
			toLocale: nonNull(GraphQLString)
		},
		resolve({
			args: {
				csv,
				fromLocale,
				thesaurusId,
				toLocale
			}
		}) {
			return {
				taskId: submitTask({
					descriptor: 'import_csv_to_thesaurus',
					config: {
						csv,
						fromLocale,
						thesaurusId,
						toLocale
					}
				})
			};
		},
		type: glue.getObjectType(GQL_TYPE_TASK_SUBMITTED)
	});
}
