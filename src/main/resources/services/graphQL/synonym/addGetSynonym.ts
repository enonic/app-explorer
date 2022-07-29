import type {Glue} from '../Glue';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getSynonym} from '/lib/explorer/synonym/getSynonym';
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
		}) => getSynonym({
			explorerRepoReadConnection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			_id
		}),
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	})
}
