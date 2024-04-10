import type { Node } from '@enonic-types/lib-node';
import type { DocumentNode } from '@enonic-types/lib-explorer/Document';
import type { Request } from '../../types/Request';
import type { RequestItem } from './documentNodeToBodyItem';


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
import documentNodeToBodyItem from './documentNodeToBodyItem';


const COLLECTOR_ID = `${APP_EXPLORER}:documentRestApi`;
const COLLECTOR_VERSION = app.version;


export type PutRequest = Request<{
	collection?: string
	documentType?: string
	documentTypeId?: string
	id?: string
	requireValid?: 'true' | 'false'
	returnDocument?: 'true' | 'false'
},{
	collectionName?: string
	documentId?: string
}>


export default function put(request: PutRequest, partial = false) {
	const {
		body: bodyJson,
		params: {
			documentType: documentTypeParam,
			documentTypeId: documentTypeIdParam,
			id: idParam = '',
			requireValid: requireValidParam = 'true',
			returnDocument: returnDocumentParam = 'false',
		} = {},
		pathParams: {
			collectionName = '',
			documentId = idParam
		} = {}
	} = request;

	const boolRequireValid = requireValidParam !== 'false'; // Thus fallsback to true if something invalid provided
	const boolReturnDocument = returnDocumentParam !== 'false'; // Fallsback to false if something invalid is provided

	if (!collectionName) {
		return {
			body: {
				error: 'Missing required parameter collection!'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	if (!documentId) {
		return {
			body: {
				error: 'Missing required parameter id!'
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

	const writeToCollectionBranchConnection = connect({
		branch: 'master',
		principals: [Principal.EXPLORER_WRITE], // Additional principals to execute the callback with
		repoId//,
		//user // Default is the default user
	});

	if (!writeToCollectionBranchConnection.exists(documentId)) {
		return {
			body: {
				id: documentId,
				error: `Document with id "${documentId}" does not exist in collection "${collectionName}"!`
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}

	let data: RequestItem;
	try {
		data = JSON.parse(bodyJson);
	} catch (e) {
		log.error('Unable to JSON.parse:%s', bodyJson);
		return {
			body: {
				id: documentId,
				error: 'Failed to JSON.parse',
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
				id: documentId,
				error: `Unable to get CollectionNode from collectionName:${collectionName}!`
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}
	const collectionId = collectionNode._id;
	let updatedNode: Node<DocumentNode>;
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
			documentTypeId: documentTypeIdParam,
			documentTypeName: documentTypeParam,
			partial,
			requireValid: boolRequireValid
		}));
	} catch (e) {
		log.error(`Something went wrong while trying to update document with id:${documentId}!`, e); // Log the stack trace
		return {
			body: {
				id: documentId,
				error: `Something went wrong while trying to update document with id:${documentId}!`
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}
	return {
		body: documentNodeToBodyItem({
			documentNode: updatedNode,
			includeDocument: boolReturnDocument
		}),
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}
