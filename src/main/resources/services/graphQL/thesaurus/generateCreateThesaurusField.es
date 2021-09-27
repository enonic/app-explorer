import {toStr} from '@enonic/js-utils';

import {
	//NT_THESAURUS,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {thesaurus as thesaurusModel} from '/lib/explorer/model/2/nodeTypes/thesaurus';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLString,
	nonNull
} from '/lib/graphql';


export function generateCreateThesaurusField({
	GQL_INPUT_TYPE_THESAURUS_LANGUAGE,
	GQL_TYPE_THESAURUS
}) {
	return {
		args: {
			_name: nonNull(GraphQLString),
			language: GQL_INPUT_TYPE_THESAURUS_LANGUAGE
		},
		resolve({
			args: {
				_name,
				language
			}
		}) {
			const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
			const createdNode = writeConnection.create(thesaurusModel({
				_name,
				language
			}));
			log.debug(`createdNode:${toStr(createdNode)}`);
			writeConnection.refresh();
			return createdNode;
		},
		type: GQL_TYPE_THESAURUS
	};
}

/*
mutation CreateThesaurusMutation(
  $_name: String!,
  $language: ThesaurusLanguageInput!
) {
  createThesaurus(
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    language {
      from
      to
    }
  }
}
*/
