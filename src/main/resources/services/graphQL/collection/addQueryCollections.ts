//import {toStr} from '@enonic/js-utils';
//import {getIn} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString
	//@ts-ignore
} from '/lib/graphql';


import {
	GQL_QUERY_COLLECTIONS,
	GQL_TYPE_COLLECTIONS_QUERY_RESULT
} from '../constants';
import {queryCollections} from './queryCollections';


export function addQueryCollections({
	glue
}) {
	return glue.addQuery({
		name: GQL_QUERY_COLLECTIONS,
		args: {
			//count: GraphQLInt, // Prefering perPage for now
			page: GraphQLInt, // Preferring page for now
			perPage: GraphQLInt,
			query: GraphQLString,
			sort: GraphQLString//,
			//start: GraphQLInt
		},
		resolve: (env :{
			args :{
				page ?:string//number
				perPage ?:string//number
				query ?:string
				sort ?:string
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			return queryCollections(env.args);
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTIONS_QUERY_RESULT)
	});
}
