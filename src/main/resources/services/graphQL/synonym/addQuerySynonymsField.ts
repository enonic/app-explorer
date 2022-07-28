import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {
	QueryFilters,
	QueriedSynonym
} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';


import {
	//QUERY_FUNCTION_FULLTEXT,
	//QUERY_FUNCTION_NGRAM,
	addQueryFilter,
	//storage,
	toStr
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


/*const bool = storage.query.dsl.bool;
const fulltext = storage.query.dsl.fulltext;
const ngram = storage.query.dsl.ngram;
const or = storage.query.dsl.or;
const stemmed = storage.query.dsl.stemmed;
const term = storage.query.dsl.term;*/


export function addQuerySynonymsField({
	glue
} :{
	glue :Glue
}) {
	glue.addQuery<{
		count ?:number
		filters ?:QueryFilters
		from ?:string
		languages ?:Array<string>
		query ?:string
		page ?:number
		perPage ?:number
		sort ?:string
		start ?:number
		thesaurusNames ?:Array<string>
		to ?:string
	}>({
		name: 'querySynonyms',
		args: {
			count: GraphQLInt,
			filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME),
			from: GraphQLString,
			languages: list(GraphQLString),
			query: GraphQLString,
			page: GraphQLInt,
			perPage: GraphQLInt,
			sort: GraphQLString,
			start: GraphQLInt,
			thesaurusNames: list(GraphQLString),
			to: GraphQLString
		},
		resolve: ({
			args: {
				filters = {},
				from,
				//highlight, // TODO?
				languages = [],
				query: queryArg = '',
				page = 1, // NOTE First index is 1 not 0
				perPage = 10,
				count = perPage, // NOTE: lib-explorer/synonym/query defaults to -1
				start = (page - 1 ) * perPage,
				thesaurusNames = [],
				to,
				sort = (from || queryArg || to) ? '_score DESC' : '_name ASC',
			}
		}) => {
			//log.debug(`env:${toStr(env)}`);
			if(thesaurusNames) {
				thesaurusNames.forEach(thesaurusName => {
					filters = addQueryFilter({
						clause: 'should',
						filters,
						filter: hasValue('_parentPath', `/thesauri/${thesaurusName}`)
					});
				});
			}

			if (languages && languages.length) {
				for (let i = 0; i < languages.length; i++) {
				    const locale = languages[i];
					filters = addQueryFilter({
						clause: 'must',
						filters,
						filter: {
							exists: {
								field: `languages.${locale}`
							}
						}
					});
				} // for languages
			}
			log.debug('filters:%s', toStr(filters));

			/*const queries = [];
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
					: '';*/
			/*const query = bool(
				//term('languages.zxx.synonyms.use')
			);*/
			const query = '';
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
