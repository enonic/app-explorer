import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';


export function remove(request) {
	const {
		params: {
			apiKey = '',
			//branch = branchDefault,
			collection: collectionParam = '',
			id: idParam
		} = {},
		pathParams: {
			collection: collectionName = collectionParam
		} = {}
	} = request;
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
	if (!idParam) {
		return {
			body: {
				message: 'Missing required url query parameter id!'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	const readConnection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});

	/*const collection = getCollection({
		connection: readConnection,
		name: collectionName
	});

	if (!collection) {
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}*/

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
						field: '_nodeType',
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

	/*const {
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
	const writeToCollectionBranchConnection = connect({
		branch: branchId,
		principals: [PRINCIPAL_EXPLORER_WRITE],
		repoId
	});

	let idsArray = forceArray(idParam);

	const responseArray = [];
	idsArray.forEach((id) => {
		//log.info(`ids:${toStr(ids)}`);
		const getRes = readFromCollectionBranchConnection.get(id);
		//log.info(`getRes:${toStr(getRes)}`);

		let item = {};
		if (!getRes) { // getRes === null
			item.error = `Unable to find document with _id = ${id}!`;
		} else if (Array.isArray(getRes)) { // getRes === [{},{}]
			item.error = `Found multiple documents with _id = ${id}!`;
		} else { // getRes === {}
			const deleteRes = writeToCollectionBranchConnection.delete(id);
			if (deleteRes.length === 1) {
				item._id = getRes._id;
			} else {
				item.error = `Unable to delete documents with _id = ${id}!`;
			}
		}
		responseArray.push(item);
	}); // forEach key

	return {
		body: responseArray,
		contentType: 'text/json;charset=utf-8'
	};
} // function remove
