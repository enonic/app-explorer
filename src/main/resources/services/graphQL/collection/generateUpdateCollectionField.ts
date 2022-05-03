//import {toStr} from '@enonic/js-utils';

import {updateCollection} from '/lib/explorer/collection/updateCollection';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME,
	GQL_INPUT_TYPE_COLLECTION_CRON_NAME,
	GQL_TYPE_COLLECTION_NAME
} from '../constants';


export function generateUpdateCollectionField({
	glue
}) {
	return {
		args: {
			_id: glue.getScalarType('_id'),
			_name: glue.getScalarType('_name'),
			//_path: GQL_TYPE_PATH,
			collector: glue.getInputType(GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME),
			cron: list(glue.getInputType(GQL_INPUT_TYPE_COLLECTION_CRON_NAME)),
			doCollect: GraphQLBoolean,
			documentTypeId: GraphQLID, // NOTE NOT nonNull
			language: GraphQLString
		},
		resolve({args}) {
			//log.debug(`generateUpdateCollectionField.resolve args:${toStr(args)}`);
			return updateCollection(args);
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTION_NAME)
	};
}
