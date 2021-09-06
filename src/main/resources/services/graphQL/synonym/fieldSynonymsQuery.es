//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as qS} from '/lib/explorer/synonym/query';

import {
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {QUERY_FILTERS_INPUT_OBJECT_TYPE} from '../noQL';
import {
	GQL_TYPE_OBJECT_SYNONYMS_QUERY,
	forceTypeSynonym
} from './types';


export const querySynonymsResolver = ({
	count, // NOTE: lib-explorer/synonym/query defaults to -1
	filters = {},
	//highlight, // TODO?
	query = '',
	sort,
	start = 0
}) => {
	//log.info(`filters:${toStr(filters)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const synonymsRes = qS({
		connection,
		count,
		filters,
		//highlight, // TODO?
		query,
		sort,
		start
	});
	//log.debug(`synonymsRes:${toStr(synonymsRes)}`);
	synonymsRes.hits = synonymsRes.hits.map((item) => forceTypeSynonym(item));

	//log.debug(`synonymsRes:${toStr(synonymsRes)}`);
	return synonymsRes;
}; // querySynonymsResolver


export const fieldSynonymsQuery = {
	args: {
		count: GraphQLInt,
		filters: QUERY_FILTERS_INPUT_OBJECT_TYPE,
		query: GraphQLString,
		sort: GraphQLString,
		start: GraphQLInt
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		return querySynonymsResolver(env.args);
	},
	type: GQL_TYPE_OBJECT_SYNONYMS_QUERY
}; // fieldSynonymsQuery

/* Example query
{
	querySynonyms(
		count: -1
		filters: {
	  		boolean: {
				must: {
		  			hasValue: {
						field: "thesaurusReference"
						values: [
							"dce02ab6-f851-4ee9-a84f-28dcd3027eee"
		  				]
		  			}
				}
	  		}
		}
		query: "thesaurusReference = 'dce02ab6-f851-4ee9-a84f-28dcd3027eee'"
		sort: "_from ASC"
		start: 0
	) {
		total
		count
		hits {
			_id
			#_name
			_nodeType
			_path
			#displayName
			from
			#thesaurus
			thesaurusReference
			to
			#type
		}
	}
}
*/
