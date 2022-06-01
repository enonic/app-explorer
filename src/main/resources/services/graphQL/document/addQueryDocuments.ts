import {
	addQueryFilter//,
	//camelize,
	//toStr
} from '@enonic/js-utils';
import {getCollectionIds} from '/lib/explorer/collection/getCollectionIds';
import {
	COLLECTION_REPO_PREFIX,
	FIELD_PATH_GLOBAL,
	FIELD_PATH_META,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
//import {queryDocumentTypes} from '/lib/explorer/documentType/queryDocumentTypes';
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
	GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS,
	GQL_INPUT_TYPE_AGGREGATION,
	//GQL_INPUT_TYPE_AGGREGATION_COUNT,
	GQL_INPUT_TYPE_AGGREGATION_TERMS,
	GQL_QUERY_DOCUMENTS,
	GQL_TYPE_AGGREGATION_TERMS_BUCKET_NAME,
	GQL_TYPE_AGGREGATION_TERMS_NAME,
	GQL_TYPE_DOCUMENT_NAME,
	GQL_TYPE_DOCUMENT_QUERY_RESULT_NAME
} from '../constants';


type AggregationArg = {
	name :string
	count ?:{
		fields :Array<string>
	}
	terms ?:{
		field :string
		order ?:string
		size ?:number
		minDocCount ?:number
	}
}

type AggregationRes = Record<string,{
	buckets :Array<{
		key :string
		docCount :number
	}>
}>

type QueryRes = {
	aggregations :Record<string,AggregationRes>
	count :number
	total :number
	hits :Array<{
		branch :string
		id :string
		repoId :string
		score :number
	}>
}


// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]*
const FIELD_NAME_TO_PATH = {
	collectionName: 'document_metadata.collection'
};


function aggregationsArgToQuery({
	aggregationsArg = []
} :{
	aggregationsArg ?:Array<AggregationArg>
}) {
	const obj = {};
	for (let i = 0; i < aggregationsArg.length; i++) {
	    const {
			name,
			/*count: {
				fields
			} = {},*/
			terms: {
				field,
				order,
				size,
				minDocCount
			} = {}
		} = aggregationsArg[i];
		//if (field) {
		obj[name] = {
			terms: {
				field: FIELD_NAME_TO_PATH[field],
				order,
				size,
				minDocCount
			}
		};
		/*} else if (fields && fields.length) {
			obj[name] = {
				count: {
					field: fields[0]
				}
			};
		}*/
	} // for
	return obj;
} // aggregationsArgToQuery


function aggregationsResToList({
	aggregations = {}
} :{
	aggregations ?:Record<string,AggregationRes>
}) {
	const list = [];
	const names = Object.keys(aggregations);
	for (let i = 0; i < names.length; i++) {
	    const name = names[i];
		list.push({
			name,
			buckets: aggregations[name]['buckets']
		});
	}
	return list;
} // aggregationsResToList


export function addQueryDocuments({
	glue
}) {
	glue.addEnumType({
		name: GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS,
		values: Object.keys(FIELD_NAME_TO_PATH)
	});

	glue.addQuery({
		name: GQL_QUERY_DOCUMENTS,
		args: {
			aggregations: list(glue.addInputType({
				name: GQL_INPUT_TYPE_AGGREGATION,
				fields: {
					name: { type: nonNull(GraphQLString) },
					/*count: { type: glue.addInputType({
						name: GQL_INPUT_TYPE_AGGREGATION_COUNT,
						fields: {
							fields: {
								type: nonNull(list(glue.getEnumType(GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS)))
							}
						}
					})},*/
					terms: { type: glue.addInputType({
						name: GQL_INPUT_TYPE_AGGREGATION_TERMS,
						fields: {
							field: {
								type: nonNull(glue.getEnumType(GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS))
							},
							order: {
								type: GraphQLString
							},
							size: {
								type: GraphQLInt
							},
							minDocCount: {
								type: GraphQLInt
							}
						}
					})},
				}
			})),
			collections: list(GraphQLString),
			count: GraphQLInt,
			start: GraphQLInt
		},
		resolve(env :{
			args: {
				aggregations ?:Array<AggregationArg>
				count ?:number
				collections ?:Array<string>
				start ?:number
			}
		}) {
			//log.debug('env:%s', toStr(env));

			const {
				args: {
					aggregations: aggregationsArg = [],
					collections = [],
					count = 10,
					start = 0
				}
			} = env;
			//log.debug('aggregations:%s', toStr(aggregations));
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

			/*const documentTypes = queryDocumentTypes({
				readConnection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
			}).hits;*/
			//log.debug('documentTypes:%s', toStr(documentTypes));

			//const fieldNameToPath = {};
			const aggregations = aggregationsArgToQuery({aggregationsArg});
			/*for (let i = 0; i < documentTypes.length; i++) {
			    const {properties} = documentTypes[i];
				for (let j = 0; j < properties.length; j++) {
				    const {name} = properties[j];
					const camelizedFieldKey = camelize(name, /[.-]/g);
					if (fieldNameToPath[camelizedFieldKey]) {
						//log.debug(`name:${camelizedFieldKey} -> path:${name} already exist in fieldNameToPath`);
						if (fieldNameToPath[camelizedFieldKey] !== name) {
							log.error(`name:${camelizedFieldKey} newPath:${name} does not match oldPath:${fieldNameToPath[camelizedFieldKey]}!`);
						}
					} else {
						fieldNameToPath[camelizedFieldKey] = name;
						aggregations[`_count_Field_${camelizedFieldKey}`] = {
							count: {
								field: name
							}
						}
					}
				} // for properties
			} // for documentTypes
			//log.debug('fieldNameToPath:%s', toStr(fieldNameToPath));*/

			const multiConnectParams = {
				principals: [PRINCIPAL_EXPLORER_READ],
				sources
			};
			//log.debug('multiConnectParams:%s', toStr(multiConnectParams));
			const multiRepoReadConnection = multiConnect(multiConnectParams);

			const multiRepoQueryParams = {
				aggregations,
				count,
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
				query: '',
				start
			};
			//log.debug('multiRepoQueryParams:%s', toStr(multiRepoQueryParams));

			const queryResult = multiRepoReadConnection.query(multiRepoQueryParams) as unknown as QueryRes;
			//log.debug('queryResult:%s', toStr(queryResult));
			//log.debug('queryResult.aggregations:%s', toStr(queryResult.aggregations));

			return {
				aggregations: aggregationsResToList({
					aggregations: queryResult.aggregations
				}),
				aggregationsAsJson: JSON.stringify(queryResult.aggregations),
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
				aggregations: { type: list(glue.addObjectType({
					name: GQL_TYPE_AGGREGATION_TERMS_NAME,
					fields: {
						name: { type: nonNull(GraphQLString) },
						buckets: { type: list(glue.addObjectType({
							name: GQL_TYPE_AGGREGATION_TERMS_BUCKET_NAME,
							fields: {
								docCount: { type: nonNull(GraphQLInt) },
								key: { type: nonNull(GraphQLString) }
							}
						}))},
					}
				}))},
				aggregationsAsJson: { type: GraphQLJson },
				count: { type: nonNull(GraphQLInt) },
				total: { type: nonNull(GraphQLInt) },
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
