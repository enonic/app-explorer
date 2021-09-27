//import {toStr} from '@enonic/js-utils';

import {
	GraphQLFloat,
	GraphQLInt,
	nonNull,
	list,
	reference
} from '/lib/graphql';

import {referencedByMapped} from './referencedByMapped';

export const GQL_TYPE_REFERENCED_BY_NAME = 'referencedBy';

export function generateReferencedByField({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
}) {
	const {createObjectType} = schemaGenerator;
	return {
		args: {
			_id: GQL_TYPE_ID
		},
		resolve: ({args: {_id}}) => referencedByMapped({_id}),
		type: createObjectType({
			name: GQL_TYPE_REFERENCED_BY_NAME,
			fields: {
				count: { type: nonNull(GraphQLInt) },
				hits: {
					type: list(createObjectType({
						name: 'referencedByHits',
						fields: {
							_id: { type: GQL_TYPE_ID },
							_name: { type: GQL_TYPE_NAME },
							_nodeType: { type: GQL_TYPE_NODE_TYPE },
							_path: { type: GQL_TYPE_PATH },
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
