import {
	RESPONSE_TYPE_JSON,
	addQueryFilter,
	camelize,
	toStr,
	ucFirst
} from '@enonic/js-utils';
import {
	createInputObjectType,
	createObjectType,
	createSchema,
	execute,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {getFields} from '/lib/explorer/field/getFields';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';

//import {DEFAULT_INTERFACE_FIELDS} from '../constants';


function washDocumentNode(node) {
	Object.keys(node).forEach((k) => {
		if (k.startsWith('_') || k.startsWith('document_metadata')) {
			delete node[k];
		}
	});
	return node;
}


function generateSchemaForInterface(interfaceName) {
	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	log.debug(`interfaceNode:${toStr(interfaceNode)}`);
	const {
		collections,
		fields,// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords,
		synonyms
	} = filterInterface(interfaceNode);
	//log.debug(`collections:${toStr(collections)}`);
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	log.debug(`synonyms:${toStr(synonyms)}`);

	const fieldsRes = getFields({connection: explorerRepoReadConnection});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);

	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsHighlightsFields = {};
	fieldsRes.hits.forEach(({key}) => {
		const camelizedFieldKey = camelize(key, /-/g);
		//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: createInputObjectType({
			name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
			fields: {
				fragmenter: { type: GraphQLString },
				fragmentSize: { type: GraphQLInt },
				noMatchSize: { type: GraphQLInt },
				numberOfFragments: { type: GraphQLInt },
				order: { type: GraphQLString },
				postTag: { type: GraphQLString },
				preTag: { type: GraphQLString },
				requireFieldMatch: { type: GraphQLBoolean }
			}
		})};
		interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(GraphQLString) };
	});
	//log.debug(`fieldsObj:${toStr(fieldsObj)}`);

	const highlightProperties = createInputObjectType({
		name: 'HighlightParameterProperties',
		fields: highlightParameterPropertiesFields
	});

	return createSchema({
		query: createObjectType({
			name: 'Query',
			fields: {
				search: {
					args: {
						highlight: createInputObjectType({
							name: 'HighlightParameter',
							fields: {
								encoder: { type: GraphQLString }, // Global only
								fragmenter: { type: GraphQLString },
								fragmentSize: { type: GraphQLInt },
								noMatchSize: { type: GraphQLInt },
								numberOfFragments: { type: GraphQLInt },
								order: { type: GraphQLString },
								postTag: { type: GraphQLString },
								preTag: { type: GraphQLString },
								requireFieldMatch: { type: GraphQLBoolean },
								tagsSchema: { type: GraphQLString }, // Global only
								properties: { type: highlightProperties }
							}
						}),
						searchString: GraphQLString
					},
					resolve: (env) => {
						const {
							args: {
								highlight = {
									//encoder: 'html' // html value will force escaping html, if you use html highlighting tags
									//fragmenter: 'span', // simple
									//fragmentSize: 100,
									//noMatchSize: 0,
									//numberOfFragments: 5,
									//order: 'none', // score
									//postTag: '</em>',
									//preTag: '<em>',
									//requireFieldMatch: true,
									//tagsSchema: 'styled'
								},
								searchString = ''
							}
						} = env;
						//log.debug(`highlight:${toStr(highlight)}`);

						//log.debug(`searchString:${toStr(searchString)}`);
						const washedSearchString = wash({string: searchString});
						//log.debug(`washedSearchString:${toStr({washedSearchString})}`);

						// TODO stopWords could be cached:
						const listOfStopWords = [];
						if (stopWords && stopWords.length) {
							stopWords.forEach((name) => {
								const {words} = getStopWordsList({ // Not a query
									connection: explorerRepoReadConnection,
									name
								});
								//log.debug(toStr({words}));
								words.forEach((word) => {
									if (!listOfStopWords.includes(word)) {
										listOfStopWords.push(word);
									}
								});
							});
						}
						//log.debug(`listOfStopWords:${toStr({listOfStopWords})}`);

						const removedStopWords = [];
						const searchStringWithoutStopWords = removeStopWords({
							removedStopWords,
							stopWords: listOfStopWords,
							string: washedSearchString
						});
						//log.debug(`searchStringWithoutStopWords:${toStr({searchStringWithoutStopWords})}`);
						//log.debug(`removedStopWords:${toStr({removedStopWords})}`);

						const queryParams = {
							count: 1, // TODO DEBUG Use "GraphQL iterator instead..."
							filters: addQueryFilter({
								filter: hasValue('_nodeType', [NT_DOCUMENT])
							}),
							highlight,
							query: `fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`
						};
						log.debug(`queryParams:${toStr({queryParams})}`);

						const multiConnectParams = {
							principals: [PRINCIPAL_EXPLORER_READ],
							sources: collections.map(collection => ({
								repoId: `${COLLECTION_REPO_PREFIX}${collection}`,
								branch: 'master', // NOTE Hardcoded
								principals: [PRINCIPAL_EXPLORER_READ]
							}))
						};
						//log.debug(`multiConnectParams:${toStr({multiConnectParams})}`);

						const multiRepoReadConnection = multiConnect(multiConnectParams);

						const queryRes = multiRepoReadConnection.query(queryParams);
						log.debug(`queryRes:${toStr({queryRes})}`);

						queryRes.hits = queryRes.hits.map(({
							branch,
							highlight,
							id,
							repoId,
							score
						}) => ({
							highlight,
							json: JSON.stringify(washDocumentNode(connect({
								branch,
								principals: [PRINCIPAL_EXPLORER_READ],
								repoId
							}).get(id))),
							score
						}));
						log.debug(`queryRes:${toStr({queryRes})}`);

						return queryRes;
					},
					type: createObjectType({
						name: 'InterfaceSearch',
						fields: {
							total: { type: nonNull(GraphQLInt) },
							count: { type: nonNull(GraphQLInt) },
							hits: { type: list(createObjectType({
								name: 'InterfaceSearchHits',
								fields: {
									highlight: { type: createObjectType({
										name: 'InterfaceSearchHitsHighlights',
										fields: interfaceSearchHitsHighlightsFields
									})},
									json: { type: GraphQLString },
									score: { type: GraphQLFloat }
								}
							})) }
						}
					})
				}
			}
		})
	});
}


export function post(request) {
	//log.debug(`request:${toStr(request)}`);
	const {
		body: bodyJson = '{}',
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		},
		pathParams: {
			interfaceName// = 'default'
		} = {}
	} = request;
	log.debug(`authorization:${toStr(authorization)}`);
	// TODO get apiKey from authorization header...
	//log.debug(`interfaceName:${toStr(interfaceName)}`);
	const body = JSON.parse(bodyJson);
	const {query, variables} = body;
	log.debug(`query:${toStr(query)}`);
	log.debug(`variables:${toStr(variables)}`);
	return {
		contentType: RESPONSE_TYPE_JSON,
		body: execute(generateSchemaForInterface(interfaceName), query, variables)
	};
}

/*
{
	search(
    highlight: {
      #encoder: "html"
      fragmenter: "simple"
      fragmentSize: 255
      noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
      numberOfFragments: 1
      #order: "none"
      postTag: "</b>"
      preTag: "<b>"
      requireFieldMatch: false
      #tagsSchema: "styled"
      properties: {
        title: {
          #fragmenter: "simple"
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: "none"
          #requireFieldMatch: false
        }
        text: {
          fragmenter: "span"
      		fragmentSize: 50
      		#noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
      		numberOfFragments: 2
      		order: "score"
      		#postTag: "</b>"
      		#preTag: "<b>"
      		#requireFieldMatch: false
        }
        uri: {
          #fragmenter: "simple"
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: "none"
          #requireFieldMatch: false
        }
      }
    }
    searchString: "domain"
  ) {
    count
    total
    hits {
      highlight {
        title
        text
        uri
      }
      json
      score
    }
  }
}
*/
