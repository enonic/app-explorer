import type {
	AnyObject,
	DocumentNode
} from '/lib/explorer/types/index.d';


import {
	getIn,
	toStr
} from '@enonic/js-utils';
//@ts-ignore
import {newCache} from '/lib/cache';
import {
	COLLECTION_REPO_PREFIX,
	FIELD_PATH_META,
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
import {addAggregationInput} from '../aggregations/guillotine/input/addAggregationInput';


type Hit = DocumentNode & {
	_collection :string
	//_collector ?:string  // from FIELD_PATH_META
	//_collectorVersion ?:string  // from FIELD_PATH_META
	_createdTime ?:string // from FIELD_PATH_META
	_documentType ?:string // from FIELD_PATH_META
	//_highlight ?:Record<string,Array<string>>
	//_json :string
	_json :Hit
	_modifiedTime ?:string // from FIELD_PATH_META
	//_language ?:string // from FIELD_PATH_META
	_score :number
	//_stemmingLanguage ?:string // from FIELD_PATH_META
}


const SECONDS_TO_CACHE = 10;

const schemaCache = newCache({
	size: 1,
	expire: SECONDS_TO_CACHE
});

const schemaGenerator = newSchemaGenerator();


export function makeSchema() {
	return schemaCache.get('static-key', () => {
		//log.debug('caching a new schema for %s seconds', SECONDS_TO_CACHE);

		const glue = constructGlue({schemaGenerator});

		glue.addQueryField<{
			args :{ // Typescript input types
				aggregations ?:Array<AnyObject> // TODO?
				count ?:number
				searchString :string
				start ?:number
			},
			context: {
				interfaceName :string
			}
		}, { // Typescript return types
			count :number
			hits :Array<Hit>
			total :number
		}>({
			args: { // GraphQL input types
				aggregations: list(addAggregationInput({glue})),
				count: GraphQLInt,
				searchString: GraphQLString,
				start: GraphQLInt
			},
			name: 'search',
			resolve: ({
				args: {
					aggregations: aggregationsArg,
					count, // ?:number
					searchString = '', // :string
					start // ?:number
				},
				context: {
					interfaceName
				}
			}) => {
				//log.debug('aggregationsArg:%s', toStr(aggregationsArg));
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
					aggregationsArg,
					count,
					fields,
					filters: {}, // TODO
					searchString,
					start,
					stopWords
				});
				const queryRes = multiRepoReadConnection.query(queryParams);
				//log.debug('queryRes:%s', toStr(queryRes));
				//log.debug('queryRes.aggregations:%s', toStr(queryRes.aggregations));

				const rv = {
					aggregationsAsJson: queryRes.aggregations, // GraphQL automatically converts to JSON
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
						//log.debug('collectionNode:%s', toStr(collectionNode));

						const washedNode = washDocumentNode(collectionNode) as Hit;
						washedNode._collection = collectionName;
						washedNode._createdTime = getIn(collectionNode, [FIELD_PATH_META, 'createdTime'], undefined);
						washedNode._documentType = getIn(collectionNode, [FIELD_PATH_META, 'documentType'], undefined);
						washedNode._json = JSON.parse(JSON.stringify(washedNode)) as Hit; // deref to avoid circular reference
						washedNode._modifiedTime = getIn(collectionNode, [FIELD_PATH_META, 'modifiedTime'], undefined);
						washedNode._score = score;
						//log.debug('washedNode:%s', toStr(washedNode));

						return washedNode;
					}),
					total: queryRes.total
				};
				return rv
			},
			type: glue.addObjectType({
				name: 'SearchResult',
				fields: {
					aggregationsAsJson: { type: GraphQLJson },
					count: { type: nonNull(GraphQLInt) },
					hits: { type: list(glue.addObjectType({
						name: 'SearchResultHit',
						fields: {
							_collection: { type: nonNull(GraphQLString) },
							_createdTime: { type: GraphQLString },
							_documentType: { type: GraphQLString },
							_json: { type: nonNull(GraphQLJson) },
							_modifiedTime: { type: GraphQLString },
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
