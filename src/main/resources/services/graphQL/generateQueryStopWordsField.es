//import {forceArray, toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/stopWords/query';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_STOP_WORDS_NAME
} from './constants';


export  function generateQueryStopWordsField({
	glue
}) {
	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const STOPWORDS_OBJECT_TYPE = glue.addObjectType({
		name: GQL_TYPE_STOP_WORDS_NAME,
		fields: {
			...interfaceNodeFields,
			displayName: { type: nonNull(GraphQLString) },
			words: { type: list(GraphQLString) }
		},
		interfaces: [interfaceNodeType]
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
				_versionKey,
				displayName,
				words//,
				//type
			}) => ({
				_id: id,
				_name: name,
				_nodeType,
				_path,
				_versionKey,
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
				count: { type: glue.getScalarType('count') },
				hits: { type: list(STOPWORDS_OBJECT_TYPE) },
				total: { type: glue.getScalarType('total') }
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
			_nodeType
			_path
			_versionKey
			displayName
			words
			type
		}
	}
}
*/
