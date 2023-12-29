import type { Guillotine } from '@enonic/js-utils/types/node/query/Filters.d';
import type { Glue } from '../Glue';
import type { AggregationArg } from '../types';

// import {toStr} from '@enonic/js-utils';
// import {getIn} from '@enonic/js-utils';
import {addAggregationInput} from '/lib/explorer/interface/graphql/aggregations/guillotine/input/addAggregationInput';
import {addFilterInput} from '/lib/explorer/interface/graphql/filters/guillotine/input/addFilterInput';
import {
	GraphQLInt,
	GraphQLString,
	list,
	// @ts-expect-error No types yet
} from '/lib/graphql';


import {
	GQL_QUERY_COLLECTIONS,
	GQL_TYPE_COLLECTIONS_QUERY_RESULT
} from '../constants';
import {queryCollections} from './queryCollections';


export function addQueryCollections({
	glue
}: {
	glue: Glue
}) {
	return glue.addQuery({
		name: GQL_QUERY_COLLECTIONS,
		args: {
			aggregations: list(addAggregationInput({
				glue: glue as any
			})),
			// count: GraphQLInt, // Prefering perPage for now
			filters: list(addFilterInput({ glue: glue as any })),
			page: GraphQLInt, // Preferring page for now
			perPage: GraphQLInt,
			query: GraphQLString,
			sort: GraphQLString//,
			// start: GraphQLInt
		},
		resolve: (env: {
			args: {
				aggregations?: AggregationArg[]
				filters?: Guillotine.BooleanFilter
				page?: string//number
				perPage?: string//number
				query?: string
				sort?: string
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			return queryCollections(env.args);
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTIONS_QUERY_RESULT)
	});
}
