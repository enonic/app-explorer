import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_STOP_WORDS_NAME,
	GQL_TYPE_STOP_WORDS_QUERY_RESULT_NAME
} from '../constants';

export function addStopWordsTypes({glue}) {
	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const STOPWORDS_OBJECT_TYPE = glue.addObjectType({
		name: GQL_TYPE_STOP_WORDS_NAME,
		fields: {
			...interfaceNodeFields,
			words: { type: list(GraphQLString) }
		},
		interfaces: [interfaceNodeType]
	}); // STOPWORDS_OBJECT_TYPE

	glue.addObjectType({
		name: GQL_TYPE_STOP_WORDS_QUERY_RESULT_NAME,
		//description:
		fields: {
			count: { type: glue.getScalarType('count') },
			hits: { type: list(STOPWORDS_OBJECT_TYPE) },
			total: { type: glue.getScalarType('total') }
		} // fields
	});
}
