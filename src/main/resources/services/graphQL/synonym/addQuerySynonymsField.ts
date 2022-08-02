import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {
	QueryFilters,
	QueriedSynonym
} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';


import {
	addQueryFilter,
	storage//,
	//toStr
} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {javaLocaleToSupportedLanguage} from '/lib/explorer/stemming/javaLocaleToSupportedLanguage';
import {getThesaurus} from '/lib/explorer/thesaurus/getThesaurus';
import {query as queryThesauri} from '/lib/explorer/thesaurus/query';
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


//const and = storage.query.dsl.and;
const bool = storage.query.dsl.bool;
const fulltext = storage.query.dsl.fulltext;
const ngram = storage.query.dsl.ngram;
const or = storage.query.dsl.or;
const stemmed = storage.query.dsl.stemmed;
//const term = storage.query.dsl.term;


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
			thesaurusNames: list(GraphQLString), // Can be empty
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
			//log.debug('thesaurusNames:%s', toStr(thesaurusNames));
			const highlightLocales = [];
			const localeToStemmingLanguage :Record<string,string> = {};
			const explorerRepoReadConnection = connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			});
			if(thesaurusNames.length) {
				thesaurusNames.forEach(thesaurusName => {
					filters = addQueryFilter({
						clause: 'should',
						filters,
						filter: hasValue('_parentPath', `/thesauri/${thesaurusName}`)
					});
					const { // TODO Refactor
						//_id,
						allowedLanguages
					} = getThesaurus({
						connection: explorerRepoReadConnection,
						_name: thesaurusName
					});
					for (let i = 0; i < allowedLanguages.length; i++) {
					    const locale = allowedLanguages[i];
						if (!highlightLocales.includes(locale)) {
							highlightLocales.push(locale);
						}
						if (locale !== 'zxx' && !localeToStemmingLanguage[locale]) {
							localeToStemmingLanguage[locale] = javaLocaleToSupportedLanguage(locale); // Doesn't support zxx
						}
					}
				});
			} else {
				const {hits} = queryThesauri({
					connection: explorerRepoReadConnection,
					count: -1,
					getSynonymsCount: false
				});
				for (let i = 0; i < hits.length; i++) { // TODO Refactor
				    const {
						allowedLanguages
					} = hits[i];
					for (let j = 0; j < allowedLanguages.length; j++) {
					    const locale = allowedLanguages[j];
						if (!highlightLocales.includes(locale)) {
							highlightLocales.push(locale);
						}
						if (locale !== 'zxx' && !localeToStemmingLanguage[locale]) {
							localeToStemmingLanguage[locale] = javaLocaleToSupportedLanguage(locale); // Doesn't support zxx
						}
					}
				}
			}
			//log.debug('highlightLocales:%s', toStr(highlightLocales));
			//log.debug('localeToStemmingLanguage:%s', toStr(localeToStemmingLanguage));

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
			//log.debug('filters:%s', toStr(filters));

			const highlight = {
				//encoder: 'default', // default, html
				//fragmenter: 'span', // span, simple
				fragmentSize: -1, // 100
				//noMatchSize: 255,
				numberOfFragments: 1, // 5
				//order: 'none', // none, score
				postTag: '</b>',
				preTag: '<b>',
				properties: {
					//_alltext: {}
				},
				//requireFieldMatch: false,// true
				//tagsSchema: 'styled'
			};

			const shouldQueries = [];

			if (from) {
				shouldQueries.push(fulltext('languages.*.from.synonym', from, 'AND'));
				shouldQueries.push(fulltext('languages.*.both.synonym', from, 'AND'));

				//shouldQueries.push(fulltext(highlightLocales.map((l) => `languages.${l}.from.synonym`), from, 'AND'));
				shouldQueries.push(ngram('languages.*.from.synonym', from, 'AND'));
				shouldQueries.push(ngram('languages.*.both.synonym', from, 'AND'));

				const locales = Object.keys(localeToStemmingLanguage);
				if (locales.length) {
					for (let i = 0; i < locales.length; i++) {
						const l = locales[i];
						shouldQueries.push(stemmed(`languages.${l}.from.synonym`, from, 'AND', localeToStemmingLanguage[l]));
						shouldQueries.push(stemmed(`languages.${l}.both.synonym`, from, 'AND', localeToStemmingLanguage[l]));
					}
				}

				for (let i = 0; i < highlightLocales.length; i++) {
					const l = highlightLocales[i];
					highlight.properties[`languages.${l}.from.synonym`] = {};
					highlight.properties[`languages.${l}.both.synonym`] = {};
				}
			} // if from

			if (to) {
				shouldQueries.push(fulltext('languages.*.to.synonym', to, 'AND'));
				shouldQueries.push(fulltext('languages.*.both.synonym', to, 'AND'));

				//shouldQueries.push(fulltext(highlightLocales.map((l) => `languages.${l}.to.synonym`), to, 'AND'));
				shouldQueries.push(ngram('languages.*.to.synonym', to, 'AND'));
				shouldQueries.push(ngram('languages.*.both.synonym', to, 'AND'));

				const locales = Object.keys(localeToStemmingLanguage);
				if (locales.length) {
					for (let i = 0; i < locales.length; i++) {
						const l = locales[i];
						shouldQueries.push(stemmed(`languages.${l}.to.synonym`, to, 'AND', localeToStemmingLanguage[l]));
						shouldQueries.push(stemmed(`languages.${l}.both.synonym`, to, 'AND', localeToStemmingLanguage[l]));
					}
				}
				for (let i = 0; i < highlightLocales.length; i++) {
					const l = highlightLocales[i];
					highlight.properties[`languages.${l}.to.synonym`] = {};
					highlight.properties[`languages.${l}.both.synonym`] = {};
				}
			} // if to

			const query = shouldQueries.length ? bool(or(shouldQueries)) : '';
			//log.debug('query:%s', toStr(query));

			const querySynonymsParams = {
				count,
				filters,
				highlight,
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
				localeToStemmingLanguage :Record<string,string>
				page :number
				start :number
				total :number
				totalPages :number
			};
			result.localeToStemmingLanguage = localeToStemmingLanguage;
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
