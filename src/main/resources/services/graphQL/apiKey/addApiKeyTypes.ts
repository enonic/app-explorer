import {
	DateTime as GraphQLDateTime,
	GraphQLBoolean,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_TYPE_API_KEY_NAME
} from '../constants';


export function addApiKeyTypes({glue}) {
	glue.addObjectType({
		name: GQL_TYPE_API_KEY_NAME,
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			//_nodeType: { type: nonNull(GraphQLString) }, // Useless info, always the same
			//_path: { type: glue.getScalarType('_path') }, // No reason to expose
			collections: { type: list(GraphQLString)}, // Nullable
			createdTime: { type: nonNull(GraphQLDateTime) },
			creator: { type: nonNull(GraphQLString) },
			interfaces: { type: list(GraphQLString)}, // Nullable
			hashed: { type: nonNull(GraphQLBoolean) },
			key: { type: nonNull(GraphQLString) },
			modifiedTime: { type: GraphQLDateTime }, // Nullable
			modifier: { type: GraphQLString } // Nullable
		}
	});
}
