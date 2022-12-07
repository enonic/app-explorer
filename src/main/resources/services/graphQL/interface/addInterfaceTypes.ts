/*import {
	//forceArray,
	toStr
} from '@enonic/js-utils';*/

import {
	coerseInterfaceTypeCollectionIds,
	coerseInterfaceTypeFields,
	coerseInterfaceTypeStopWords,
	coerseInterfaceTypeSynonymIds,
	coerseInterfaceTypeTermQueries,
} from '/lib/explorer/interface/coerseInterfaceType';
import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_INTERFACE_FIELD_NAME,
	GQL_TYPE_INTERFACE_NAME,
	GQL_TYPE_INTERFACE_TERM_QUERY_NAME,
} from '../constants';


export function addInterfaceTypes({glue}) {
	glue.addInputType({
		name: GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			boost: { type: GraphQLFloat } // null allowed
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME,
		fields: {
			boost: { type: GraphQLFloat }, // null allowed
			field: { type: nonNull(GraphQLString) },
			type: { type: GraphQLString }, // TODO Enum?
			booleanValue: { type: GraphQLBoolean },
			doubleValue: { type: GraphQLFloat },
			longValue: { type: GraphQLInt },
			stringValue: { type: GraphQLString },
		}
	});

	glue.addObjectType({
		name: GQL_TYPE_INTERFACE_FIELD_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			boost: { type: GraphQLFloat } // null allowed
		}
	});

	glue.addObjectType({
		name: GQL_TYPE_INTERFACE_TERM_QUERY_NAME,
		fields: {
			boost: { type: GraphQLFloat }, // null allowed
			field: { type: nonNull(GraphQLString) },
			type: { type: GraphQLString }, // TODO Enum?
			booleanValue: { type: GraphQLBoolean },
			doubleValue: { type: GraphQLFloat },
			longValue: { type: GraphQLInt },
			stringValue: { type: GraphQLString },
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
			collectionIds: {
				resolve: (env) => coerseInterfaceTypeCollectionIds(env.source.collectionIds),
				type: list(GraphQLID)
			}, // null allowed
			fields: {
				resolve: (env) => coerseInterfaceTypeFields(env.source.fields),
				type: list(glue.getObjectType(GQL_TYPE_INTERFACE_FIELD_NAME))
			}, // null allowed
			//stopWordIds: { type: list(GraphQLID) }, // null allowed
			stopWords: {
				resolve: (env) => coerseInterfaceTypeStopWords(env.source.stopWords),
				type: nonNull(list(GraphQLString)) // empty list allowed
			},
			synonymIds: {
				resolve: (env) => coerseInterfaceTypeSynonymIds(env.source.synonymIds),
				type: list(GraphQLID) }, // null allowed
			termQueries: {
				resolve: (env) => coerseInterfaceTypeTermQueries(env.source.termQueries),
				type: list(glue.getObjectType(GQL_TYPE_INTERFACE_TERM_QUERY_NAME))
			}, // null allowed
		},
		interfaces: [interfaceNodeType]
	});
}
