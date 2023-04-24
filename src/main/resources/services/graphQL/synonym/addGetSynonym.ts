import type {Glue} from '../Glue';


import { Principal } from '@enonic/explorer-utils';
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
				principals: [Principal.EXPLORER_READ]
			}),
			_id
		}),
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	})
}
