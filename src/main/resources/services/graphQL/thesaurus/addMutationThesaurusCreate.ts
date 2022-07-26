//import {toStr} from '@enonic/js-utils';

import {
	//NT_THESAURUS,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {thesaurus as thesaurusModel} from '/lib/explorer/model/2/nodeTypes/thesaurus';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {GQL_TYPE_THESAURUS_NAME} from '../constants';


export function addMutationThesaurusCreate({
	glue
}) {
	glue.addMutation({
		name: 'createThesaurus',
		args: {
			_name: glue.getScalarType('_name'),
			allowedLanguages: list(GraphQLString)
		},
		resolve({
			args: {
				_name,
				allowedLanguages
			}
		}) {
			const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
			const createdNode = writeConnection.create(thesaurusModel({
				_name,
				allowedLanguages
			}));
			//log.debug(`createdNode:${toStr(createdNode)}`);
			writeConnection.refresh();
			return createdNode;
		},
		type: glue.getObjectType(GQL_TYPE_THESAURUS_NAME)
	});
}

/*
mutation CreateThesaurusMutation(
  $_name: String!,
  $allowedLanguages: [String]!
) {
  createThesaurus(
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    allowedLanguages
  }
}
*/
