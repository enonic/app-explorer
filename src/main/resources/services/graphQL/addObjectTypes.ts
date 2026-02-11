import {
	// GraphQLBoolean,
	// GraphQLFloat,
	// GraphQLID,
	GraphQLInt,
	GraphQLString,
	// Json as GraphQLJson,
	list,
	nonNull,
	reference
	// @ts-expect-error No types yet
} from '/lib/graphql';
import {
	GQL_TYPE_AGGREGATION_TERMS_NAME,
	GQL_TYPE_AGGREGATION_TERMS_BUCKET_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from './constants';


export function addObjectTypes({
	glue
}) {
	glue.addObjectType({
		name: GQL_TYPE_AGGREGATION_TERMS_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			buckets: { type: list(glue.addObjectType({
				name: GQL_TYPE_AGGREGATION_TERMS_BUCKET_NAME,
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					key: { type: nonNull(GraphQLString) },
					aggregations: { type: list(reference(GQL_TYPE_AGGREGATION_TERMS_NAME)) }
				}
			}))},
		}
	});

	glue.addObjectType({
		name: GQL_TYPE_NODE_DELETED_NAME,
		fields: {
			_id: { type: glue.getScalarType('_id') }
		}
	});
}
