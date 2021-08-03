import {
	RESPONSE_TYPE_JSON,
	addQueryFilter,
	toStr
} from '@enonic/js-utils';
import {
	createObjectType,
	createSchema,
	execute,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';

//import {DEFAULT_INTERFACE_FIELDS} from '../constants';


function washNode(node) {
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
	log.info(`interfaceNode:${toStr(interfaceNode)}`);
	const {
		collections,
		fields,// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords,
		synonyms
	} = filterInterface(interfaceNode);
	//log.info(`collections:${toStr(collections)}`);
	//log.info(`fields:${toStr(fields)}`);
	//log.info(`stopWords:${toStr(stopWords)}`);
	log.info(`synonyms:${toStr(synonyms)}`);

	return createSchema({
		query: createObjectType({
			name: 'Query',
			fields: {
				search: {
					args: {
						searchString: GraphQLString
					},
					resolve: (env) => {
						const {
							args: {
								searchString = ''
							}
						} = env;

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
								//log.info(toStr({words}));
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
						//log.debug(`queryRes:${toStr({queryRes})}`);

						queryRes.hits = queryRes.hits.map(({repoId, branch, id}) => ({
							json: JSON.stringify(washNode(connect({
								branch,
								principals: [PRINCIPAL_EXPLORER_READ],
								repoId
							}).get(id)))
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
									json: { type: GraphQLString }
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
	//log.info(`request:${toStr(request)}`);
	const {
		body: bodyJson = '{}',
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		},
		pathParams: {
			interfaceName// = 'default'
		} = {}
	} = request;
	log.info(`authorization:${toStr(authorization)}`);
	// TODO get apiKey from authorization header...
	//log.info(`interfaceName:${toStr(interfaceName)}`);
	const body = JSON.parse(bodyJson);
	const {query, variables} = body;
	log.info(`query:${toStr(query)}`);
	log.info(`variables:${toStr(variables)}`);
	return {
		contentType: RESPONSE_TYPE_JSON,
		body: execute(generateSchemaForInterface(interfaceName), query, variables)
	};
}
