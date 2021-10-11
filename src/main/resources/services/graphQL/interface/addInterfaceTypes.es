/*import {
	//forceArray,
	toStr
} from '@enonic/js-utils';*/
import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_INTERFACE_FIELD_NAME,
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function addInterfaceTypes({glue}) {
	glue.addInputType({
		name: GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
		fields: {
			//fieldId: { type: nonNull(GraphQLID) },
			name: { type: nonNull(GraphQLString) },
			boost: { type: GraphQLInt } // null allowed
		}
	});

	glue.addObjectType({
		name: GQL_TYPE_INTERFACE_FIELD_NAME,
		fields: {
			//fieldId: { type: nonNull(GraphQLID) },
			name: { type: nonNull(GraphQLString) },
			boost: { type: GraphQLInt } // null allowed
		}
	});

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	glue.addObjectType({
		name: GQL_TYPE_INTERFACE_NAME,
		fields: {
			...interfaceNodeFields,
			collectionIds: { type: list(GraphQLID) }, // null allowed
			fields: { type: list(glue.getObjectType(GQL_TYPE_INTERFACE_FIELD_NAME)) }, // null allowed
			//stopWordIds: { type: list(GraphQLID) }, // null allowed
			stopWords: { type: nonNull(list(GraphQLString)) }, // empty list allowed
			synonymIds: { type: list(GraphQLID) } // null allowed
		},
		interfaces: [interfaceNodeType]
	});
}
