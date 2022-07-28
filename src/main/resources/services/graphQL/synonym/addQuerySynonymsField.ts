import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {
	QueryFilters,
	QueriedSynonym
} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';


import {
	QUERY_FUNCTION_FULLTEXT,
	QUERY_FUNCTION_NGRAM,
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';
import {hasValue} from '/lib/explorer/query/hasValue';
import {
	GraphQLInt,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME
} from '../constants';
import {querySynonyms} from './querySynonyms';


export function addQuerySynonymsField({
	glue
} :{
	glue :Glue
}) {
	glue.addQuery({
		name: 'querySynonyms',
		args: {
			count: GraphQLInt,
			filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME),
			from: GraphQLString,
			query: GraphQLString,
			page: GraphQLInt,
			perPage: GraphQLInt,
			sort: GraphQLString,
			start: GraphQLInt,
			thesaurusNames: list(GraphQLString),
			to: GraphQLString
		},
		resolve: (env :{
			args :{
				count ?:number
				filters ?:QueryFilters
				from ?:string
				query ?:string
				page ?:number
				perPage ?:number
				sort ?:string
				start ?:number
				thesaurusNames ?:Array<string>
				to ?:string
			}
		}) => {
			//log.debug(`env:${toStr(env)}`);
			const {
				from,
				//highlight, // TODO?
				query: queryArg = '',
				page = 1, // NOTE First index is 1 not 0
				perPage = 10,
				count = perPage, // NOTE: lib-explorer/synonym/query defaults to -1
				start = (page - 1 ) * perPage,
				thesaurusNames = [],
				to,
				sort = (from || queryArg || to) ? '_score DESC' : '_name ASC',
			} = env.args;

			let {
				filters = {},
			} = env.args;
			if(thesaurusNames) {
				thesaurusNames.forEach(thesaurusName => {
					filters = addQueryFilter({
						clause: 'should',
						filters,
						filter: hasValue('_parentPath', `/thesauri/${thesaurusName}`)
					});
				});
			}
			//log.debug('filters:%s', toStr(filters));

			const queries = [];
			if (from) {
				queries.push(`(${QUERY_FUNCTION_FULLTEXT}('from^2', '${from}', 'AND') OR ${QUERY_FUNCTION_NGRAM}('from^1', '${from}', 'AND'))`);
			}
			if (to) {
				queries.push(`(${QUERY_FUNCTION_FULLTEXT}('to^2', '${to}', 'AND') OR ${QUERY_FUNCTION_NGRAM}('to^1', '${to}', 'AND'))`);
			}
			const query = queries.length
				? queryArg
					? `(${queryArg}) AND (${queries.join(' OR ')})`
					: `(${queries.join(' OR ')})`
				: queryArg
					? queryArg
					: '';
			//log.debug('query:%s', toStr(query));

			const querySynonymsParams = {
				count,
				filters,
				query,
				sort,
				start
			};
			//log.debug('querySynonymsParams:%s', toStr(querySynonymsParams));

			const result = querySynonyms(querySynonymsParams) as {
				aggregations ?:{
					thesaurus :AggregationsResponseEntry
				}
				count :number
				end :number
				hits: Array<QueriedSynonym>
				page :number
				start :number
				total :number
				totalPages :number
			};
			result.page = page;
			result.start = start + 1;
			result.end = Math.min(start + perPage, result.total);
			result.totalPages = Math.ceil(result.total / perPage);

			//log.debug('result:%s', toStr(result));
			return result;
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME)
	});
}

/* Example query
{
	querySynonyms(
		#count: -1
		#filters: {
	  	#	boolean: {
		#		must: {
		#			hasValue: {
		#				field: "thesaurusReference"
		#				values: [
		#					"dce02ab6-f851-4ee9-a84f-28dcd3027eee"
		#				]
		#			}
		#		}
	  	#	}
		#}
		#from: "ord"
		#query: "thesaurusReference = 'dce02ab6-f851-4ee9-a84f-28dcd3027eee'"
		#sort: "_from ASC"
		#start: 0
		#to: "word"
		#thesaurusNames: [
		#	"ordbok"
		#]
	) {
		aggregations {
			thesaurus {
				buckets {
					docCount
					key
				}
			}
		}
		count
		end
		page
		start
		total
		totalPages
		hits {
			_id
			_name
			_nodeType
			_path
			_score
			_versionKey
			thesaurus
			thesaurusReference
			# TODO
		}
	}
}
*/
