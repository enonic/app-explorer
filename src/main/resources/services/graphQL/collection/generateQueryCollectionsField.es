//import {toStr} from '@enonic/js-utils';
//import getIn from 'get-value';

import {
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';


import {GQL_TYPE_COLLECTIONS_QUERY_RESULT} from '../constants';
import {queryCollections} from './queryCollections';


export function generateQueryCollectionsField({
	glue
}) {
	return {
		args: {
			//count: GraphQLInt, // Prefering perPage for now
			page: GraphQLInt, // Preferring page for now
			perPage: GraphQLInt,
			query: GraphQLString,
			sort: GraphQLString//,
			//start: GraphQLInt
		},
		resolve: (env) => {
			//log.info(`env:${toStr(env)}`);
			return queryCollections(env.args);
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTIONS_QUERY_RESULT)
	};
}
