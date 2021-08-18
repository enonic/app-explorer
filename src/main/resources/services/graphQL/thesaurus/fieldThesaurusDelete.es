//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLString,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

const {
	createObjectType
} = newSchemaGenerator();


const TYPE_ID = nonNull(GraphQLString);


export const fieldThesaurusDelete = {
	args: {
		_id: TYPE_ID
	},
	resolve({
		args: {
			_id
		}
	}) {
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
		const array = writeConnection.delete(_id);
		if (!array.length === 1 ) {
			throw new Error(`Something went wrong while trying to delete thesaurus with id:${_id}!`);
		}
		writeConnection.refresh();
		return {
			_id: array[0]
		};
	},
	type: createObjectType({
		name: 'ThesaurusDeleted',
		fields: {
			_id: { type: TYPE_ID }
		}
	})
}; // fieldThesaurusDelete
