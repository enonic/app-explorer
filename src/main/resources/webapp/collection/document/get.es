import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	NT_API_KEY,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';

import {respondWithHtml} from './documentation';

function respondWithJson({
	apiKey,
	collectionName,
	count,
	filters,
	query,
	sort,
	start
}) {
	if (!collectionName) {
		return {
			body: {
				message: 'Missing required parameter collection!'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}
	if (!apiKey) {
		return {
			body: {
				message: 'Missing required url query parameter apiKey!'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	const readConnection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});

	const hashedApiKey = hash(apiKey);
	//log.info(`hashedApiKey:${toStr(hashedApiKey)}`);

	const matchingApiKeys = readConnection.query({
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'key',
						values: [hashedApiKey]
					}
				},{
					hasValue: {
						field: '_nodetype',
						values: [NT_API_KEY]
					}
				}]
			}
		}
	});
	//log.info(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`API key hashedApiKey:${hashedApiKey} not found!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	const apiKeyNodeId = matchingApiKeys.hits[0].id;
	const apiKeyNode = readConnection.get(apiKeyNodeId);
	//log.info(`apiKeyNode:${toStr(apiKeyNode)}`);

	if (!apiKeyNode) { // This should never happen (index out of sync)
		log.error(`API key hashedApiKey:${hashedApiKey} found, but unable to get id:${apiKeyNodeId}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	if (!apiKeyNode.collections) {
		log.error(`API key hashedApiKey:${hashedApiKey} found, but access too no collections!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	if (!forceArray(apiKeyNode.collections).includes(collectionName)) {
		log.error(`API key hashedApiKey:${hashedApiKey} does not have access to collection:${collectionName}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	/*const collection = getCollection({
		connection: readConnection,
		name: collectionName
	});

	if (!collection) {
		log.error(`Could not get collection:${collectionName}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}
	const {
		collector: {
			config: {
				apiKeys = []
			} = {}
		} = {}
	} = collection;

	const arrApiKeys = forceArray(apiKeys);
	let keyMatch = false;
	for (let i = 0; i < arrApiKeys.length; i++) {
		const {key} = arrApiKeys[i];
		//log.info(`key:${toStr(key)}`);
		if(key === hashedApiKey) {
			keyMatch = true;
			break;
		}
	} // for

	if (!keyMatch) {
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}*/

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);

	const branchId = 'master'; // Deliberate hardcode
	const readFromCollectionBranchConnection = connect({
		branch: branchId,
		principals: [PRINCIPAL_EXPLORER_READ],
		repoId
	});

	const queryParams = {
		count,
		filters,
		query,
		sort,
		start
	};
	//log.info(`queryParams:${toStr(queryParams)}`);

	const queryRes = readFromCollectionBranchConnection.query(queryParams);
	//log.info(`queryRes:${toStr(queryRes)}`);

	const keys = queryRes.hits.map(({id}) => id);
	//log.info(`keys:${toStr(keys)}`);

	const getRes = readFromCollectionBranchConnection.get(keys);
	//log.info(`getRes:${toStr(getRes)}`);

	const strippedRes = forceArray(getRes).map((node) => {
		// Not allowed to see any underscore fields (except _id, _name, _path)
		Object.keys(node).forEach((k) => {
			if (k === '_id' || k === '_name' || k === '_path') {
				// no-op
			} else if (k.startsWith('_')) {
				delete node[k];
			}
		});
		return node;
	});
	//log.info(`strippedRes:${toStr(strippedRes)}`);

	return {
		body: strippedRes,
		contentType: 'text/json;charset=utf-8'
	};
} // respondWithJson


export function get(request) {
	//log.info(`request:${toStr(request)}`);
	const {
		//body = "{}", // TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
		headers: {
			Accept: acceptHeader
		},
		//method,
		params: {
			apiKey = '',
			//branch = branchDefault,
			collection: collectionParam = '',
			count: countParam = '10',
			filters: filtersParam = '{}',
			id: idParam,
			query = '',
			sort = 'score DESC',
			start: startParam = '0'
		} = {},
		pathParams: {
			collection: collectionName = collectionParam
		} = {}
	} = request;

	//log.info(`idParam:${toStr(idParam)}`);
	const filters = JSON.parse(filtersParam);
	if (!filters.boolean) {
		filters.boolean = {};
	}
	if (!filters.boolean.must) {
		filters.boolean.must = [];
	} else if (!Array.isArray(filters.boolean.must)) {
		filters.boolean.must = [filters.boolean.must];
	}
	filters.boolean.must.push({
		hasValue: {
			field: '_nodeType',
			values: [NT_DOCUMENT]
		}
	});
	if (idParam) {
		if (!filters.ids) {
			filters.ids = {};
		}
		if(!filters.ids.values) {
			filters.ids.values = [];
		}
		forceArray(idParam).forEach((id) => {
			filters.ids.values.push(id);

		});
	}
	//log.info(`filters:${toStr(filters)}`);

	const count = Math.max(1, // Don't allow < 1
		Math.min(100, // Don't allow > 100
			parseInt(countParam, 10)
		)
	);
	//log.info(`count:${count}`);
	const start = parseInt(startParam, 10);

	if (
		acceptHeader.startsWith('application/json') ||
		acceptHeader.startsWith('text/json')
	) {
		return respondWithJson({
			apiKey,
			count,
			collectionName,
			filters,
			query,
			sort,
			start
		});
	} else {
		return respondWithHtml({
			apiKey,
			count,
			filters,
			query,
			sort,
			start
		});
	}
}
