import type {Glue} from '../Glue';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getThesaurus} from '/lib/explorer/thesaurus/getThesaurus'
import {
	GraphQLID,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_TYPE_THESAURUS_NAME} from '../constants';


export function addGetThesaurus({
	glue
} :{
	glue :Glue
}) {
	glue.addQuery<{
		_id :string
	}>({
		args: {
			_id: nonNull(GraphQLID)
		},
		name: 'getThesaurus',
		resolve: ({
			args: {
				_id
			}
		}) => {
			return getThesaurus({
				connection: connect({
					principals: [PRINCIPAL_EXPLORER_READ]
				}),
				_id
			});
		},
		type: glue.getObjectType(GQL_TYPE_THESAURUS_NAME)
	})
}
