//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_QUERY_FILTERS_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME
} from '../constants';
import {querySynonyms} from './querySynonyms';


export function generateQuerySynonymsField({
	glue
}) {
	return {
		args: {
			count: GraphQLInt,
			filters: glue.getInputType(GQL_INPUT_TYPE_QUERY_FILTERS_NAME),
			query: GraphQLString,
			sort: GraphQLString,
			start: GraphQLInt
		},
		resolve: (env) => {
			//log.info(`env:${toStr(env)}`);
			return querySynonyms(env.args);
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME)
	};
}

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
