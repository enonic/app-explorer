import type { Request } from '../../types/Request';


import {
    APP_EXPLORER,
    BRANCH_ID_EXPLORER,
	COLLECTION_REPO_PREFIX,
    Path,
	Principal,
    Repo
} from '@enonic/explorer-utils';
import { update } from '/lib/explorer/document/update';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import runWithExplorerWrite from './runWithExplorerWrite';


const COLLECTOR_ID = `${APP_EXPLORER}:documentRestApi`;
const COLLECTOR_VERSION = app.version;


export default function put(request: Request<{
    collection?: string
    id?: string
    requireValid?: 'true' | 'false'
},{
    collectionName?: string
    documentId?: string
}>, partial = false) {
    const {
        body: bodyJson,
        params: {
            collection: collectionParam,
            id: idParam = '',
            requireValid: requireValidParam = 'true'
        } = {},
        pathParams: {
            collectionName = collectionParam,
            documentId = idParam
        } = {}
    } = request;

    const boolRequireValid = requireValidParam !== 'false'; // Thus fallsback to true if something invalid provided

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
    const writeToCollectionBranchConnection = connect({
        branch: 'master',
        principals: [Principal.EXPLORER_WRITE], // Additional principals to execute the callback with
        repoId//,
        //user // Default is the default user
    });
    if (!writeToCollectionBranchConnection.exists(documentId)) {
        return {
            body: {
                message: `Document with id "${documentId}" does not exist in collection "${collectionName}"!`
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
        }
    }

    let data;
    try {
        data = JSON.parse(bodyJson);
    } catch (e) {
        log.error('Unable to JSON.parse:%s', bodyJson);
        return {
            body: {
                message: 'Failed to JSON.parse',
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
        };
    }
    
    const explorerReadConnection = connect({
		branch: BRANCH_ID_EXPLORER,
		principals: [Principal.EXPLORER_READ],
		repoId: Repo.EXPLORER
	});
	const collectionPath = `${Path.COLLECTIONS}/${collectionName}`;
	const collectionNode = explorerReadConnection.get(collectionPath);
	if (!collectionNode) {
		log.error(`Unable to get CollectionNode from collectionPath:${collectionPath}!`);
		return {
			body: {
				message: `Unable to get CollectionNode from collectionName:${collectionName}!`
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}
	const collectionId = collectionNode._id;

    let updatedNode;
    try { // Avoid internal errors to be exposed in the response
        updatedNode = runWithExplorerWrite(() => update({
            collectionId,
            collectionName,
            collectorId: COLLECTOR_ID,
            collectorVersion: COLLECTOR_VERSION,
            data: {
                _id: documentId,
                ...data
            },
            partial,
            requireValid: boolRequireValid
        }));
    } catch (e) {
        log.error(`Something went wrong while trying to update document with id:${documentId}!`, e); // Log the stack trace
        return {
            body: {
                message: `Something went wrong while trying to update document with id:${documentId}!`
            },
            contentType: 'text/json;charset=utf-8',
            status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
        };
    }
}