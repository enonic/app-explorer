import type {InputTypeSynonymLanguages} from '/lib/explorer/types/Synonym.d';
import type {Glue} from '../Glue';


import { Principal } from '@enonic/explorer-utils';
//import {toStr} from '@enonic/js-utils';
import {connect} from '/lib/explorer/repo/connect';
import {updateSynonym} from '/lib/explorer/synonym/updateSynonym';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
	GQL_TYPE_SYNONYM_NAME
} from '../constants';


export function addMutationSynonymUpdate({
	glue
} :{
	glue :Glue
}) {
	glue.addMutation<{
		// Required
		_id :string
		thesaurusId :string
		// Optional
		comment ?:string
		disabledInInterfaces ?:Array<string>
		enabled ?:boolean
		languages ?:InputTypeSynonymLanguages
	}>({
		name: 'updateSynonym',
		args: {
			_id: glue.getScalarType('_id'),
			comment: GraphQLString,
			disabledInInterfaces: list(GraphQLID),
			enabled: GraphQLBoolean,
			languages: list(glue.getInputType(GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME)),
		},
		resolve({
			args: {
				_id,
				comment,
				disabledInInterfaces,
				enabled,
				languages,
			}
		}) {
			return updateSynonym({
				_id,
				comment,
				disabledInInterfaces,
				enabled,
				languages
			},{
				explorerRepoWriteConnection: connect({
					principals: [Principal.EXPLORER_WRITE]
				}),
				checkInterfaceIds: true,
				refreshRepoIndexes: true
			});
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	});
}
