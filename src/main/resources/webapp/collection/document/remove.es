import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';


export function remove(request, collections = []) {
	const {
		params: {
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
	if (!idParam) {
		return {
			body: {
				message: 'Missing required url query parameter id!'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	if (!collections) {
		log.error(`Access too no collections!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	if (!forceArray(collections).includes(collectionName)) {
		log.error(`No access to collection:${collectionName}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

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
