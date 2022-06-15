import type {DocumentNode} from '/lib/explorer/types/index.d';


//@ts-ignore
import {newCache} from '/lib/cache';
import {
	COLLECTION_REPO_PREFIX,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {
	Json as GraphQLJson,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';
import {constructGlue} from '../utils/Glue';
import {washDocumentNode} from '../utils/washDocumentNode';
import {getInterfaceInfo} from './getInterfaceInfo';
import {makeQueryParams} from './makeQueryParams';

const SECONDS_TO_CACHE = 10;

const schemaCache = newCache({
	size: 1,
	expire: SECONDS_TO_CACHE
});

const schemaGenerator = newSchemaGenerator();


export function makeSchema() {
	return schemaCache.get('static-key', () => {
		log.debug('caching a new schema for %s seconds', SECONDS_TO_CACHE);

		const glue = constructGlue({schemaGenerator});

		glue.addQueryField<{
			args :{
				searchString :string
			},
			context: {
				interfaceName :string
			}
		}, {
			count :number
			total :number
		}>({
			args: {
				searchString: GraphQLString
			},
			name: 'search',
			resolve: ({
				args: {
					searchString
				},
				context: {
					interfaceName
				}
			}) => {
				//log.debug('interfaceName:%s searchString:%s', interfaceName, searchString);
				const {
					collectionNameToId,
					fields,
					stopWords
				} = getInterfaceInfo({
					interfaceName
				});
				const multiRepoReadConnection = multiConnect({
					principals: [PRINCIPAL_EXPLORER_READ],
					sources: Object.keys(collectionNameToId).map((collectionName) => ({
						repoId: `${COLLECTION_REPO_PREFIX}${collectionName}`,
						branch: 'master', // NOTE Hardcoded
						principals: [PRINCIPAL_EXPLORER_READ]
					}))
				});
				const queryParams = makeQueryParams({
					fields,
					filters: {}, // TODO
					searchString,
					stopWords
				});
				const queryRes = multiRepoReadConnection.query(queryParams);
				log.debug('queryRes:%s', queryRes);

				const rv = {
					count: queryRes.count,
					hits: queryRes.hits.map(({
						branch,
						//highlight, // TODO
						id,
						repoId,
						score
					}) => {
						const collectionName = repoId.replace(COLLECTION_REPO_PREFIX, '');
						const collectionNode = connect({
							branch,
							principals: [PRINCIPAL_EXPLORER_READ],
							repoId
						}).get<DocumentNode>(id);
						const washedNode = washDocumentNode(collectionNode) as DocumentNode & {
							_collection ?:string
							//_documentType ?:string
							//_highlight ?:Record<string,Array<string>>
							_json ?:string
							_score ?:number
						}
						const json = JSON.stringify(washedNode);
						/* eslint-disable no-underscore-dangle */
						washedNode._collection = collectionName;
						washedNode._json = json;
						washedNode._score = score;
						/* eslint-enable no-underscore-dangle */
						return washedNode;
					}),
					total: queryRes.total
				};
				return rv
			},
			type: glue.addObjectType({
				name: 'SearchResult',
				fields: {
					count: { type: nonNull(GraphQLInt) },
					hits: { type: list(glue.addObjectType({
						name: 'SearchResultHit',
						fields: {
							_collection: { type: nonNull(GraphQLString) },
							_json: { type: GraphQLJson },
							_score: { type: nonNull(GraphQLFloat) }
						}}))
					},
					total: { type: nonNull(GraphQLInt) }
				}
			})
		}); // addQueryField search

		return glue.buildSchema();
	}); // schemaCache.get
} // makeSchema
