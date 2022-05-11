//import {toStr} from '@enonic/js-utils';


import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_TYPE_HAS_FIELD_QUERY_RESULT_NAME
} from './constants';
import {hasField} from './collection/hasField';


export function hasFieldQuery({
	glue
}) {
	return {
		args: {
			collections: nonNull(list(nonNull(GraphQLString))),
			count: GraphQLInt,
			field: nonNull(GraphQLString),
			filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME)
		},
		resolve: ({args}) => hasField(args),
		type: glue.addObjectType({
			name: GQL_TYPE_HAS_FIELD_QUERY_RESULT_NAME,
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: { type: list(glue.addObjectType({
					name: 'hasFieldQueryHits',
					fields: {
						_branchId: { type: glue.getScalarType('_branchId') },
						_id: { type: glue.getScalarType('_id') },
						_name: { type: glue.getScalarType('_name') },
						_nodeType: { type: glue.getScalarType('_nodeType') },
						_path: { type: glue.getScalarType('_path') },
						_repoId: { type: glue.getScalarType('_repoId') },
						_score: { type: glue.getScalarType('_score') },
						_versionKey: { type: glue.getScalarType('_versionKey') }
					}
				}))},
				total: { type: glue.getScalarType('total') }
			}
		})
	}; // return
}
