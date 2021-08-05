//import {forceArray, toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/stopWords/query';

const {
	createObjectType
} = newSchemaGenerator();


const STOPWORDS_OBJECT_TYPE = createObjectType({
	name: 'StopWords',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		words: { type: list(GraphQLString) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // STOPWORDS_OBJECT_TYPE


export const queryStopWords = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);
		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const stopWordsRes = query({
			connection
		});
		//log.info(`stopWordsRes:${toStr(stopWordsRes)}`);
		stopWordsRes.hits = stopWordsRes.hits.map(({
			id,
			name,
			_nodeType,
			_path,
			displayName,
			words//,
			//type
		}) => ({
			_id: id,
			_name: name,
			_nodeType,
			_path,
			displayName,
			//words: words ? forceArray(words) : null,
			words//, // Always array
			//type
		}));
		return stopWordsRes;
	},
	type: createObjectType({
		name: 'QueryStopWords',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(STOPWORDS_OBJECT_TYPE) }
		} // fields
	})
}; // queryStopWords


/* Example query
{
	queryStopWords {
		total
		count
		hits {
			_id
			_name
			_path
			displayName
			words
			type
		}
	}
}
*/
