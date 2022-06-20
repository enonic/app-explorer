import type {Glue} from '../../utils/Glue';
import type {
	EmptyObject,
	GraphQLContext,
	Hit
} from './index.d';


//import {toStr} from '@enonic/js-utils';
import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {addObjectTypeSearchResultHit} from './addObjectTypeSearchResultHit';


type SearchConnectionEdgeEnv = {
	args :EmptyObject
	context :GraphQLContext,
	source :{
		cursor :number
		node :Hit
	}
}


export function addObjectTypeSearchConnectionEdge({glue} :{glue :Glue}) {
	return glue.addObjectType({
		name: 'SearchConnectionEdge',
		fields: {
			cursor: {
				type: nonNull(GraphQLString),
				resolve(env :SearchConnectionEdgeEnv) {
					//log.debug('SearchConnectionEdge cursor resolve env:%s', toStr(env));
					return env.source.cursor;
				}
			},
			node: {
				type: addObjectTypeSearchResultHit({glue}),
				resolve(env :SearchConnectionEdgeEnv) {
					//log.debug('SearchConnectionEdge node resolve env:%s', toStr(env));
					return env.source.node;
				}
			}
		}
	});
}
