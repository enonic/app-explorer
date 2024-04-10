import type { Request } from '../../types/Request';
import type { DocumentNode } from '@enonic-types/lib-explorer/Document';


import {
	COLLECTION_REPO_PREFIX,
	Principal
} from '@enonic/explorer-utils';
import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import documentNodeToBodyItem from './documentNodeToBodyItem';
import runWithExplorerRead from './runWithExplorerRead';
import runWithExplorerWrite from './runWithExplorerWrite';


export type DeleteOneRequest = Request<{
	collection?: string
	id?: string
},{
	collectionName?: string
	documentId?: string
}>;

export default function deleteOne(request: DeleteOneRequest) {
	// log.debug('deleteOne request:%s', toStr(request));

	const {
		params: {
			id: idParam = ''
		} = {},
		pathParams: {
			collectionName = '',
			documentId = idParam
		} = {}
	} = request;

	if (!collectionName) {
		return {
			body: {
				error: 'Missing required parameter collection!',
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	if (!documentId) {
		return {
			body: {
				error: 'Missing required parameter id!',
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	const maybeErrorResponse = authorize(request, collectionName);

	if (maybeErrorResponse.status !== 200 ) {
		return maybeErrorResponse;
	}

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	// log.debug('repoId:%s', repoId);

	const branchId = 'master'; // Deliberate hardcode

	const writeToCollectionBranchConnection = connect({
		branch: branchId,
		principals: [Principal.EXPLORER_WRITE],
		repoId
	});

	if (!runWithExplorerRead(() => writeToCollectionBranchConnection.exists(documentId))) {
		return {
			body: {
				error: `Document with id "${documentId}" does not exist in collection "${collectionName}"!`,
				id: documentId,
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}

	const documentNode = runWithExplorerRead(() => writeToCollectionBranchConnection.get<DocumentNode>(documentId));
	if (!documentNode) { // This will probably never happen
		return {
			body: {
				error: `Document with id "${documentId}" in collection "${collectionName} is empty"!`,
				id: documentId,
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}

	let deleteRes = [];
	try { // Avoid internal errors to be exposed in the response
		deleteRes = runWithExplorerWrite(() => writeToCollectionBranchConnection.delete(documentId));
		log.debug('deleteOne deleteRes:%s', toStr(deleteRes));
	} catch (e) {
		log.error(`Something went wrong while trying to delete document with id:${documentId}!`, e); // Log the stack trace
		return {
			body: {
				error: `Something went wrong while trying to delete document with id:${documentId}!`,
				id: documentId,
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}

	if (!deleteRes.length) {
		return {
			body: {
				error: `Something went wrong while trying to delete document with id:${documentId}!`,
				id: documentId,
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}

	runWithExplorerWrite(() => writeToCollectionBranchConnection.refresh());

	return {
		body: documentNodeToBodyItem({
			documentNode
		}),
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}
