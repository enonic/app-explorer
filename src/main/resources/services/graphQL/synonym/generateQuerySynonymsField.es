//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {generateNoQLTypes} from '../generateNoQLTypes';
import {querySynonyms} from './querySynonyms';


export function generateQuerySynonymsField({
	GQL_TYPE_OBJECT_SYNONYMS_QUERY,
	schemaGenerator
}) {
	const {
		QUERY_FILTERS_INPUT_OBJECT_TYPE
	} = generateNoQLTypes({
		schemaGenerator
	});
	return {
		args: {
			count: GraphQLInt,
			filters: QUERY_FILTERS_INPUT_OBJECT_TYPE,
			query: GraphQLString,
			sort: GraphQLString,
			start: GraphQLInt
		},
		resolve: (env) => {
			//log.info(`env:${toStr(env)}`);
			return querySynonyms(env.args);
		},
		type: GQL_TYPE_OBJECT_SYNONYMS_QUERY
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
