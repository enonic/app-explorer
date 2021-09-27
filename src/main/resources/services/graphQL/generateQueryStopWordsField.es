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
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_TOTAL,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;

	const STOPWORDS_OBJECT_TYPE = createObjectType({
		name: 'StopWords',
		//description:
		fields: {
			_id: { type: GQL_TYPE_ID },
			_name: { type: GQL_TYPE_NAME },
			_nodeType: { type: GraphQLString }, // TODO nonNull?
			_path: { type: GQL_TYPE_PATH },
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
		type: createObjectType({
			name: 'QueryStopWords',
			//description:
			fields: {
				count: { type: GQL_TYPE_COUNT },
				hits: { type: list(STOPWORDS_OBJECT_TYPE) },
				total: { type: GQL_TYPE_TOTAL }
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
