
import {
	GraphQLBoolean,
	GraphQLString,
	list
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME//,
	//GQL_TYPE_PATH
} from '../types';

import {
	GQL_INPUT_TYPE_COLLECTOR,
	GQL_INPUT_TYPE_CRON,
	GQL_TYPE_COLLECTION
} from './types';
import {updateCollection} from './updateCollection';


export const fieldCollectionUpdate = {
	args: {
		_id: GQL_TYPE_ID,
		_name: GQL_TYPE_NAME,
		//_path: GQL_TYPE_PATH,
		collector: GQL_INPUT_TYPE_COLLECTOR,
		cron: list(GQL_INPUT_TYPE_CRON),
		doCollect: GraphQLBoolean,
		documentTypeId: GraphQLString,
		language: GraphQLString
	},
	resolve({args}) { return updateCollection(args); },
	type: GQL_TYPE_COLLECTION
};
