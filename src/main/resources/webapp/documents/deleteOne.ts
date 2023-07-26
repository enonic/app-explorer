import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	Principal
} from '@enonic/explorer-utils';
import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import runWithExplorerWrite from './runWithExplorerWrite';


export default function deleteOne(request: Request<{
    collection?: string
    id?: string
},{
    collectionName?: string
    documentId?: string
}>) {
    // log.debug('deleteOne request:%s', toStr(request));

    const {
        params: {
            collection: collectionParam,
            id: idParam = ''
        } = {},
        pathParams: {
            collectionName = collectionParam,
            documentId = idParam
        } = {}
    } = request;

    if (!collectionName) {
        return {
            body: {
                message: 'Missing required parameter collection!'
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
        };
    }

    if (!documentId) {
        return {
            body: {
                message: 'Missing required parameter id!'
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
    
    let deleteRes = [];
    try { // Avoid internal errors to be exposed in the response
        deleteRes = runWithExplorerWrite(() => writeToCollectionBranchConnection.delete(documentId));
        log.debug('deleteOne deleteRes:%s', toStr(deleteRes));
    } catch (e) {
        log.error(`Something went wrong while trying to delete document with id:${documentId}!`, e); // Log the stack trace
        return {
            body: {
                message: `Something went wrong while trying to delete document with id:${documentId}!`
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
        };
    }

    if (!deleteRes.length) {
        return {
            body: {
                message: `Something went wrong while trying to delete document with id:${documentId}!`
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
        };
    }

    return {
		body: {
            message: `Deleted document with id:${documentId}`
        },
		contentType: 'text/json;charset=utf-8',
        status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}