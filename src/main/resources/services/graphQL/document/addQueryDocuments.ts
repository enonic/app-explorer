import {
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';
import {getCollectionIds} from '/lib/explorer/collection/getCollectionIds';
import {
	COLLECTION_REPO_PREFIX,
	FIELD_PATH_GLOBAL,
	FIELD_PATH_META,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_QUERY_DOCUMENTS,
	GQL_TYPE_DOCUMENT_NAME,
	GQL_TYPE_DOCUMENT_QUERY_RESULT_NAME
} from '../constants';


export function addQueryDocuments({
	glue
}) {
	glue.addQuery({
		name: GQL_QUERY_DOCUMENTS,
		args: {
			collections: list(GraphQLString)
		},
		resolve(env :{
			args: {
				collections ?:Array<string>
			}
		}) {
			//log.debug('env:%s', toStr(env));

			const {
				args: {
					collections = []
				}
			} = env;
			//log.debug('collections:%s', toStr(collections));

			const explorerRepoReadConnection = connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			});

			// Get actual collections that exists
			const collectionIds = getCollectionIds({
				connection: explorerRepoReadConnection
			});
			//log.debug('collectionIds:%s', toStr(collectionIds));

			// 2 way lookup tables :)
			const collectionIdToName :Record<string,string> = {};
			const collectionNameToId :Record<string,string> = {};
			for (let i = 0; i < collectionIds.length; i++) {
			    const collectionId = collectionIds[i];
				const collectionNode = explorerRepoReadConnection.get(collectionId);
				if (collectionId && collectionNode._name) {
					collectionIdToName[collectionId] = collectionNode._name;
					collectionNameToId[collectionNode._name] = collectionId;
				}
			}
			//log.debug('collectionIdToName:%s', toStr(collectionIdToName));
			//log.debug('collectionNameToId:%s', toStr(collectionNameToId));

			const sources = [];
			if (collections && collections.length) { // Filter against exisiting collections
				for (let i = 0; i < collections.length; i++) {
				    const collectionName = collections[i];
					if (collectionNameToId[collectionName]) { // Only allow exisiting collections
						sources.push({
							repoId: `${COLLECTION_REPO_PREFIX}${collectionName}`,
							branch: 'master', // NOTE Hardcoded
							principals: [PRINCIPAL_EXPLORER_READ]
						});
					}
				}
			} else {
				for (let i = 0; i < collectionIds.length; i++) {
				    const collectionId = collectionIds[i];
					if (collectionIdToName[collectionId]) {
						sources.push({
							repoId: `${COLLECTION_REPO_PREFIX}${collectionIdToName[collectionId]}`,
							branch: 'master', // NOTE Hardcoded
							principals: [PRINCIPAL_EXPLORER_READ]
						});
					}
				}
			}
			//log.debug('sources:%s', toStr(sources));

			const multiConnectParams = {
				principals: [PRINCIPAL_EXPLORER_READ],
				sources
			};
			//log.debug('multiConnectParams:%s', toStr(multiConnectParams));
			const multiRepoReadConnection = multiConnect(multiConnectParams);

			const multiRepoQueryParams = {
				filters: addQueryFilter({ // Whitelist
					clause: 'must',
					filter: {
						exists: {
							field: 'document_metadata.collection'
						}
					},
					filters: addQueryFilter({ // Blacklist
						clause: 'mustNot',
						filter: hasValue('_nodeType', ['default'])
					})
				}),
				query: ''
			};
			//log.debug('multiRepoQueryParams:%s', toStr(multiRepoQueryParams));

			const queryResult = multiRepoReadConnection.query(multiRepoQueryParams);
			//log.debug('queryResult:%s', toStr(queryResult));

			return {
				count: queryResult.count,
				total: queryResult.total,
				hits: queryResult.hits.map(({
					branch,
					id,
					repoId//,
					//score
				}) => {
					const singleRepoReadConnection = connect({
						branch,
						principals: [PRINCIPAL_EXPLORER_READ],
						repoId
					});
					const documentNode = singleRepoReadConnection.get(id);
					//log.debug('documentNode:%s', toStr(documentNode));

					const {
						_id,
						_name,
						_nodeType,
						_path,
						_versionKey,
						...rest
					} = documentNode;

					const obj = {};
					const keys = Object.keys(rest);
					for (let i = 0; i < keys.length; i++) {
					    const key = keys[i];
						if (
							!key.startsWith('_')
							&& !key.startsWith(FIELD_PATH_GLOBAL)
							&& !key.startsWith(FIELD_PATH_META)
						) {
							obj[key] = rest[key]
						}
					}
					//log.debug('obj:%s', toStr(obj));

					return {
						_id,
						_json: JSON.stringify(obj),
						_name,
						_nodeType,
						_path,
						_versionKey
					};
				}) // hits.map
			}; // return
		}, // resolve
		type: glue.addObjectType({
			name: GQL_TYPE_DOCUMENT_QUERY_RESULT_NAME,
			fields: {
				total: { type: nonNull(GraphQLInt) },
				count: { type: nonNull(GraphQLInt) },
				hits: { type: list(glue.addObjectType({
					name: GQL_TYPE_DOCUMENT_NAME,
					fields: {
						_id: { type: glue.getScalarType('_id') },
						_json: { type: GraphQLJson },
						_name: { type: glue.getScalarType('_name') },
						_nodeType: { type: glue.getScalarType('_nodeType') },
						_path: { type: glue.getScalarType('_path') },
						_versionKey: { type: glue.getScalarType('_versionKey') }
					} // hit fields
				}))} // hits
			} // query result fields
		}) // type
	}); // glue.addQuery
} // addQueryDocuments
