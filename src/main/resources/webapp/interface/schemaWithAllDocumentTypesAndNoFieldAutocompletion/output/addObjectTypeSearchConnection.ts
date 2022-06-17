import type {Glue} from '../../utils/Glue';
import type {
	EmptyObject,
	GraphQLContext,
	SearchResolverReturnType
} from '../index.d';


//import {toStr} from '@enonic/js-utils';
import {
	Json as GraphQLJson,
	GraphQLInt,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';
import {addObjectTypeSearchConnectionEdge} from './addObjectTypeSearchConnectionEdge';
import {addObjectTypeSearchConnectionPageInfo} from './addObjectTypeSearchConnectionPageInfo';


type SearchConnectionEnv = {
	args :EmptyObject
	context :GraphQLContext,
	source :SearchResolverReturnType
}


export function addObjectTypeSearchConnection({glue} :{glue :Glue}) {
	return glue.addObjectType({
		name: 'SearchConnection',
		fields: {
			totalCount: {
				resolve: (env :SearchConnectionEnv) => {
					//log.debug('SearchConnection totalCount resolve env:%s', toStr(env));
					return env.source.total;
				},
				type: nonNull(GraphQLInt)
			},
			edges: {
				resolve(env :SearchConnectionEnv) {
					//log.debug('SearchConnection edges resolve env:%s', toStr(env));
					const hits = env.source.hits;
					const edges = [];
					for (let i = 0; i < hits.length; i++) {
						edges.push({
							node: hits[i],
							cursor: env.source.start + i
						});
					}
					//log.debug(`edges:${toStr({edges})}`);
					return edges;
				},
				type: list(addObjectTypeSearchConnectionEdge({glue}))
			},
			pageInfo: {
				resolve(env :SearchConnectionEnv) {
					//log.debug('SearchConnection pageInfo resolve env:%s', toStr(env));
					const count = env.source.hits.length;
					return {
						startCursor: env.source.start,
						endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
						hasNext: (env.source.start + count) < env.source.total
					};
				},
				type: addObjectTypeSearchConnectionPageInfo({glue})
			},
			aggregationsAsJson: { type: GraphQLJson }
		}
	});
}
