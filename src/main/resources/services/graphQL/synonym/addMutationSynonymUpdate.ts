import type {SynonymNode} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';
import type {
	InputTypeLanguageSynonym,
	InputTypeSynonymLanguages
} from './';


//import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {moldSynonymNode} from '/lib/explorer/synonym/moldSynonymNode';
import {getSynonym} from '/lib/explorer/synonym/getSynonym';
import {
	getValidInterfaceIdReferences,
	moldInputTypeLanguages
} from './addMutationSynonymCreate';
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
				comment: commentArg = '',
				disabledInInterfaces: disabledInInterfacesArg = [],
				enabled: enabledArg = true,
				languages: languagesArg = [],
			}
		}) {
			//log.debug('_id:%s', toStr(_id));
			//log.debug('comment:%s', toStr(comment));
			//log.debug('disabledInInterfaces:%s', toStr(disabledInInterfaces));
			//log.debug('enabled:%s', toStr(enabled));
			//log.debug('languages:%s', toStr(languages));
			const explorerRepoReadConnection = connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			});
			getSynonym({ // Throws if not found or wrong _nodeType
				explorerRepoReadConnection,
				_id
			});
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});

			const interfaceIdsCheckedObject :Record<string,boolean> = {};
			const modifyRes = writeConnection.modify<SynonymNode>({
				key: _id,
				editor: (node) => {
					//log.debug(`node:${toStr(node)}`);
					node.comment = commentArg;
					node.disabledInInterfaces = getValidInterfaceIdReferences({
						explorerRepoReadConnection,
						interfaceIdsArray: disabledInInterfacesArg,
						interfaceIdsCheckedObject // modified within
					});
					node.enabled = enabledArg;
					node.languages = moldInputTypeLanguages({
						explorerRepoReadConnection,
						interfaceIdsCheckedObject,
						languagesArg
					});
					//log.debug(`node:${toStr(node)}`);
					return node;
				}
			});
			if (!modifyRes) {
				throw new Error(`Something went wrong when trying to modify synonym _id:${_id}!`);
			}
			//log.debug(`modifyRes:${toStr(modifyRes)}`);
			return moldSynonymNode(modifyRes);
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	});
}
