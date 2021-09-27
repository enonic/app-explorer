//import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
} from '/lib/graphql';

import {updateCollection} from '/lib/explorer/collection/updateCollection';


export function generateUpdateCollectionField({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_INPUT_TYPE_COLLECTOR,
	GQL_INPUT_TYPE_CRON,
	GQL_TYPE_COLLECTION
}) {
	return {
		args: {
			_id: GQL_TYPE_ID,
			_name: GQL_TYPE_NAME,
			//_path: GQL_TYPE_PATH,
			collector: GQL_INPUT_TYPE_COLLECTOR,
			cron: list(GQL_INPUT_TYPE_CRON),
			doCollect: GraphQLBoolean,
			documentTypeId: GraphQLID, // NOTE NOT nonNull
			language: GraphQLString
		},
		resolve({args}) {
			//log.debug(`generateUpdateCollectionField.resolve args:${toStr(args)}`);
			return updateCollection(args);
		},
		type: GQL_TYPE_COLLECTION
	};
}
