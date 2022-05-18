//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_TYPE_REFERENCED_BY_NAME,
	GQL_UNION_TYPE_ANY_NODE
} from './constants';
import {referencedByMapped} from './referencedByMapped';


export function generateReferencedByField({
	glue
}) {
	return {
		args: {
			_id: glue.getScalarType('_id'),
			filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME)
		},
		resolve: ({args: {_id, filters}}) => referencedByMapped({
			_id,
			filters
		}),
		type: glue.addObjectType({
			name: GQL_TYPE_REFERENCED_BY_NAME,
			fields: {
				count: { type: nonNull(GraphQLInt) },
				hits: {
					type: list(glue.getUnionTypeObj(GQL_UNION_TYPE_ANY_NODE).type)
				},
				total: { type: nonNull(GraphQLInt) }
			}
		})
	};
}

/*
query QueryReferencedBy(
  $_id: ID!
) {
	referencedBy(_id: $_id) {
		count
		hits {
			_id
			_name
			_nodeType
			_path
			_score
			_referencedBy {
				count
				hits {
					_id
					_name
					_nodeType
					_path
					_score
				}
				total
			}
		}
		total
	}
}
*/
