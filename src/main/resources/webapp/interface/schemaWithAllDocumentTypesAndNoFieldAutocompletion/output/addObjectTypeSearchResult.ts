import type {Glue} from '../../utils/Glue';


import {
	Json as GraphQLJson,
	GraphQLInt,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INTERFACE_TYPE_DOCUMENT} from './constants';


export function addObjectTypeSearchResult({glue} :{glue :Glue}) {
	return glue.addObjectType({
		name: 'SearchResult',
		fields: {
			aggregationsAsJson: { type: GraphQLJson },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT)) },
			//hits: { type: list(addObjectTypeSearchResultHit({glue})) },
			start: { type: nonNull(GraphQLInt) }, // Used in search connection
			total: { type: nonNull(GraphQLInt) }
		}
	});
}
