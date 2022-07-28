import type {SynonymNode} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';

import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {coerceSynonymType} from '/lib/explorer/synonym/coerceSynonymType';
import {languagesObjectToArray} from '/lib/explorer/synonym/languagesObjectToArray';
import {
	GraphQLID
	//@ts-ignore
} from '/lib/graphql';
import {GQL_TYPE_SYNONYM_NAME} from '../constants';


export function addGetSynonym({
	glue
} :{
	glue :Glue
}) {
	glue.addQuery<{
		_id :string
	}>({
		name: 'getSynonym',
		args: {
			_id: GraphQLID
		},
		resolve: ({
			args: {
				_id
			}
		}) => {
			const explorerRepoReadConnection = connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			});
			const node = explorerRepoReadConnection.get(_id);
			if (!node) {
				throw new Error(`Couldn't find node with _id:${_id}`);
			}
			const {_nodeType} = node;
			if (_nodeType !== NT_SYNONYM) {
				log.error(`Node with _id:${_id} is not a synonym, but rather _nodeType:${_nodeType}`);
				throw new Error(`Node with _id:${_id} is not a synonym!`);
			}
			const {
				languages: languagesObject,
				...rest
			} = coerceSynonymType(node as SynonymNode);
			return {
				...rest,
				languages: languagesObjectToArray({
					languagesObject
				})
			}
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	})
}
