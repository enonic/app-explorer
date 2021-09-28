//import {toStr} from '@enonic/js-utils';

import {
	GraphQLFloat,
	GraphQLInt,
	nonNull,
	list,
	reference
} from '/lib/graphql';

import {
	//GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_REFERENCED_BY_NAME
} from './constants';
import {referencedByMapped} from './referencedByMapped';


export function generateReferencedByField({
	glue
}) {
	return {
		args: {
			_id: glue.scalarTypes._id
		},
		resolve: ({args: {_id}}) => referencedByMapped({_id}),
		type: glue.addObjectType({
			name: GQL_TYPE_REFERENCED_BY_NAME,
			fields: {
				count: { type: nonNull(GraphQLInt) },
				hits: {
					//type: list(reference(GQL_INTERFACE_NODE_NAME))
					type: list(glue.addObjectType({
						name: 'referencedByHits',
						fields: {
							_id: { type: glue.scalarTypes._id },
							_name: { type: glue.scalarTypes._name },
							_nodeType: { type: glue.scalarTypes._nodeType },
							_path: { type: glue.scalarTypes._path },
							_score: { type: nonNull(GraphQLFloat) },
							referencedBy: {
								resolve: ({source: {_id}}) => referencedByMapped({_id}),
								type: reference(GQL_TYPE_REFERENCED_BY_NAME)
							}
						}
					}))
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
			referencedBy {
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
