import type {InputTypeSynonymLanguages} from '/lib/explorer/types/Synonym.d';
import type {Glue} from '../Glue';


//import {toStr} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createSynonym} from '/lib/explorer/synonym/createSynonym';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {
	GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
	GQL_TYPE_SYNONYM_NAME
} from '../constants';


export function addMutationSynonymCreate({
	glue
} :{
	glue :Glue
}) {
	glue.addMutation<{
		// Required
		thesaurusId :string
		// Optional
		comment ?:string
		disabledInInterfaces ?:Array<string>
		enabled ?:boolean
		languages ?:InputTypeSynonymLanguages
	}>({
		name: 'createSynonym',
		args: {
			comment: GraphQLString,
			disabledInInterfaces: list(GraphQLID),
			enabled: GraphQLBoolean,
			languages: list(glue.getInputType(GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME)),
			thesaurusId: glue.getScalarType('_id'),
		},
		resolve({
			args: {
				comment,
				disabledInInterfaces,
				enabled,
				languages,
				thesaurusId
			}
		}) {
			return createSynonym({
				thesaurusId,
				comment,
				disabledInInterfaces,
				enabled,
				languages
			},{
				explorerRepoWriteConnection: connect({
					principals: [PRINCIPAL_EXPLORER_WRITE]
				}),
				checkInterfaceIds: true,
				checkThesaurus: true,
				refreshRepoIndexes: true
			});
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	});
}
