import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	Principal
} from '@enonic/explorer-utils';
import {
	array,
	forceArray//,
	//toStr
} from '@enonic/js-utils';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';


const {includes: arrayIncludes} = array;


export type RemoveRequest = Request<{
	collection?: string
	id: string | string[]
}, {
	collectionName?: string
}>


export default function deleteMany(
	request: RemoveRequest
): {
	body?: {
		message: string
	} | unknown
	contentType?: string
	status?: number
} {
	const {
		params: {
			id: idParam
		} = {},
		pathParams: {
			collectionName = ''
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

	const maybeErrorResponse = authorize(request, collectionName);

	if (maybeErrorResponse.status !== 200 ) {
		return maybeErrorResponse;
	}

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);

	const branchId = 'master'; // Deliberate hardcode
	const readFromCollectionBranchConnection = connect({
		branch: branchId,
		principals: [Principal.EXPLORER_READ],
		repoId
	});
	const writeToCollectionBranchConnection = connect({
		branch: branchId,
		principals: [Principal.EXPLORER_WRITE],
		repoId
	});

	let idsArray = forceArray(idParam);

	const responseArray = [];
	idsArray.forEach((id) => {
		//log.info(`ids:${toStr(ids)}`);
		const getRes = readFromCollectionBranchConnection.get(id);
		//log.info(`getRes:${toStr(getRes)}`);

		let item: {
			_id?: string
			error?: string
		} = {};
		if (!getRes) { // getRes === null
			item.error = `Unable to find document with _id = ${id}!`;
		} else if (Array.isArray(getRes)) { // getRes === [{},{}]
			item.error = `Found multiple documents with _id = ${id}!`;
		} else { // getRes === {}
			const deleteRes = writeToCollectionBranchConnection.delete(id);
			if (deleteRes.length === 1) {
				item._id = getRes._id;
				writeToCollectionBranchConnection.refresh();
			} else {
				item.error = `Unable to delete documents with _id = ${id}!`;
			}
		}
		responseArray.push(item);
	}); // forEach key

	return {
		body: responseArray,
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
} // function remove
