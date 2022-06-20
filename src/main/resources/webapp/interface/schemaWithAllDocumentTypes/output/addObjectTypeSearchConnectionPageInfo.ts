import type {Glue} from '../../utils/Glue';
import type {
	EmptyObject,
	GraphQLContext
} from './index.d';


//import {toStr} from '@enonic/js-utils';
import {
	GraphQLString,
	GraphQLBoolean,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {encodeCursor} from '/lib/graphql-connection';


type SearchConnectionPageInfoEnv = {
	args :EmptyObject
	context :GraphQLContext,
	source :{
		endCursor :number
		hasNext :boolean
		startCursor :number
	}
}


export function addObjectTypeSearchConnectionPageInfo({glue} :{glue :Glue}) {
	return glue.addObjectType({
		name: 'SearchConnectionPageInfo',
		fields: {
			endCursor: {
				type: nonNull(GraphQLString),
				resolve: (env :SearchConnectionPageInfoEnv) => {
					//log.debug('SearchConnectionPageInfo endCursor resolve env:%s', toStr(env));
					return encodeCursor(env.source.endCursor);
				}
			},
			hasNext: {
				type: nonNull(GraphQLBoolean),
				resolve: (env :SearchConnectionPageInfoEnv) => {
					//log.debug('SearchConnectionPageInfo hasNext resolve env:%s', toStr(env));
					return env.source.hasNext;
				}
			},
			startCursor: {
				type: nonNull(GraphQLString),
				resolve: (env :SearchConnectionPageInfoEnv) => {
					//log.debug('SearchConnectionPageInfo startCursor resolve env:%s', toStr(env));
					return encodeCursor(env.source.startCursor);
				}
			}
		}
	});
}
