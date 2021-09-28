//import {forceArray, toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/stopWords/query';


export  function generateQueryStopWordsField({
	glue
}) {

	const STOPWORDS_OBJECT_TYPE = glue.addObjectType({
		name: 'StopWords',
		//description:
		fields: {
			_id: { type: glue.scalarTypes._id },
			_name: { type: glue.scalarTypes._name },
			_nodeType: { type: GraphQLString }, // TODO nonNull?
			_path: { type: glue.scalarTypes._path },
			displayName: { type: nonNull(GraphQLString) },
			words: { type: list(GraphQLString) }//,
			//type: { type: nonNull(GraphQLString) }
		}
	}); // STOPWORDS_OBJECT_TYPE

	return {
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
		type: glue.addObjectType({
			name: 'QueryStopWords',
			//description:
			fields: {
				count: { type: glue.scalarTypes.count },
				hits: { type: list(STOPWORDS_OBJECT_TYPE) },
				total: { type: glue.scalarTypes.total }
			} // fields
		})
	};
}


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
