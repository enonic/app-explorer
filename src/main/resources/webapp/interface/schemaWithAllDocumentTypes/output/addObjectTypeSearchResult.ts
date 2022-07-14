import type {Glue} from '../../utils/Glue';


import {
	Json as GraphQLJson,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
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
			synonyms: { type: list(glue.addObjectType({
				name: 'SearchResultSynonyms',
				fields: {
					_highlight: { type: glue.addObjectType({
						name: 'SearchResultSynonymsHighlight',
						fields: {
							from: { type: list(GraphQLString) },
							to: { type: list(GraphQLString) } // Only when expand = true
						}
					})},
					_score: { type: GraphQLFloat },
					from: { type: nonNull(list(GraphQLString)) },
					thesaurusName: { type: nonNull(GraphQLString) },
					to: { type: nonNull(list(GraphQLString)) }
				}
			}))},
			total: { type: nonNull(GraphQLInt) }
		}
	});
}
