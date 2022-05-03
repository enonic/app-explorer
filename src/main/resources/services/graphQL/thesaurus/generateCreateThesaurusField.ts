//import {toStr} from '@enonic/js-utils';

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

import {
	GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME,
	GQL_TYPE_THESAURUS_NAME
} from '../constants';


export function generateCreateThesaurusField({
	glue
}) {
	return {
		args: {
			_name: glue.getScalarType('_name'),
			language: glue.getInputType(GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME)
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
			//log.debug(`createdNode:${toStr(createdNode)}`);
			writeConnection.refresh();
			return createdNode;
		},
		type: glue.getObjectType(GQL_TYPE_THESAURUS_NAME)
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
