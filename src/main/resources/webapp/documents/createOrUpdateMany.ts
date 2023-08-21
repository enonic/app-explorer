//import type {RepoConnection} from '@enonic-types/lib-explorer';
import type { DocumentNode } from '/lib/explorer/types/Document';
import type { Request } from '../../types/Request';
import type { BodyItem } from './documentNodeToBodyItem';


import {
	APP_EXPLORER,
	BRANCH_ID_EXPLORER,
	COLLECTION_REPO_PREFIX,
	Path,
	Principal,
	Repo
} from '@enonic/explorer-utils';
import {
	// array,
	forceArray,
	toStr
} from '@enonic/js-utils';
import {USER as EXPLORER_APP_USER} from '/lib/explorer/model/2/users/explorer';
//import {get as getCollection} from '/lib/explorer/collection/get';
//import {createOrModify} from '/lib/explorer/node/createOrModify';
import { connect } from '/lib/explorer/repo/connect';
import { maybeCreate as maybeCreateRepoAndBranch } from '/lib/explorer/repo/maybeCreate';
import { runAsSu } from '/lib/explorer/runAsSu';
import { create/*, ValidationError*/} from '/lib/explorer/document/create';
import { update } from '/lib/explorer/document/update';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import documentNodeToBodyItem from './documentNodeToBodyItem';
import runWithExplorerWrite from './runWithExplorerWrite';
import { RepoConnection } from '@enonic-types/lib-node';


// const {includes: arrayIncludes} = array;


export type PostRequest = Request<{
	documentType?: string
	documentTypeId?: string
	partial?: 'true' | 'false'
	requireValid?: 'true' | 'false'
	returnDocument?: 'true' | 'false'
	returnMetadata?: 'true' | 'false'
}, {
	collectionName?: string
}>



const COLLECTOR_ID = `${APP_EXPLORER}:documentRestApi`;
const COLLECTOR_VERSION = app.version;


function createDocument({
	boolRequireValid = true,
	boolReturnDocument = false,
	boolReturnMetadata = false,
	collectionId,
	collectionName,
	document,
	documentType,
	documentTypeId,
	responseArray,
}: {
	collectionId: string
	collectionName: string
	document: Record<string, unknown>
	documentType?: string
	documentTypeId?: string
	responseArray: BodyItem[]
	// Optional
	boolRequireValid?: boolean
	boolReturnDocument?: boolean
	boolReturnMetadata?: boolean
}) {
	const createdNode = create({
		collectionId,
		collectionName,
		collectorId: COLLECTOR_ID,
		collectorVersion: COLLECTOR_VERSION,
		data: document,
		documentTypeId,
		documentTypeName: documentType,
		requireValid: boolRequireValid
	});
	if(createdNode) {
		responseArray.push({
			action: 'create',
			...documentNodeToBodyItem({
				documentNode: createdNode,
				includeDocument: boolReturnDocument,
				includeMetadata: boolReturnMetadata
			}),
			status: HTTP_RESPONSE_STATUS_CODES.OK
		});
	} else {
		responseArray.push({
			action: 'create',
			error: 'Something went wrong when trying to create the document!',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		});
	}
}


function deleteDocument({
	id,
	writeToCollectionBranchConnection
}: {
	id: string
	writeToCollectionBranchConnection: RepoConnection
}) {
	// NOTE: Not wrapped with runWithExplorerWrite
	if (!writeToCollectionBranchConnection.exists(id)) {
		return {
			action: 'delete',
			error: `Document with id "${id}" doesn't exist!`,
			id,
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}
	let deleteRes = [];
	try {
		deleteRes = writeToCollectionBranchConnection.delete(id);
		return {
			action: 'delete',
			id,
			status: HTTP_RESPONSE_STATUS_CODES.OK
		};
	} catch (e) {
		log.error(`Something went wrong while trying to delete document with id:${id}!`, e); // Log the stack trace
		return {
			action: 'delete',
			error: `Something went wrong while trying to delete document with id:${id}!`,
			id,
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}
}


export function modifyDocument
({
	collectionId,
	collectionName,
	document,
	documentTypeId,
	documentType,
	id,
	responseArray,
	//user
	// Optional
	boolPartial = false,
	boolRequireValid = true,
	boolReturnDocument = false,
	boolReturnMetadata = false,
}: {
	collectionId: string
	collectionName: string
	document: Record<string, unknown>
	documentType?: string
	documentTypeId?: string
	id: string
	responseArray: BodyItem[]
	// Optional
	boolPartial?: boolean
	boolRequireValid?: boolean
	boolReturnDocument?: boolean
	boolReturnMetadata?: boolean
}) {
	// WARNING: Not wrapped with runWithExplorerWrite
	const updatedNode = update({
		collectionId,
		collectionName,
		collectorId: COLLECTOR_ID,
		collectorVersion: COLLECTOR_VERSION,
		data: {
			_id: id,
			...document
		},
		documentTypeId,
		documentTypeName: documentType,
		partial: boolPartial,
		requireValid: boolRequireValid
	});
	//log.info(`updatedNode:${toStr(updatedNode)}`);
	if(updatedNode) {
		responseArray.push({
			action: 'update',
			...documentNodeToBodyItem({
				documentNode: updatedNode,
				includeDocument: boolReturnDocument,
				includeMetadata: boolReturnMetadata
			}),
			status: HTTP_RESPONSE_STATUS_CODES.OK
		});
	} else {
		responseArray.push({
			action: 'update',
			error: 'Something went wrong when trying to update the document!',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		});
	}
}


function readDocument({
	boolReturnMetadata,
	id,
	readFromCollectionBranchConnection
}: {
	boolReturnMetadata: boolean
	id: string
	readFromCollectionBranchConnection: RepoConnection
}) {
	const documentNode = readFromCollectionBranchConnection.get<DocumentNode>(id);
	if (!documentNode) {
		return {
			action: 'read',
			id,
			error: `Document with id "${id} doesn't exist!"`,
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}
	const item = documentNodeToBodyItem({
		documentNode,
		includeMetadata: boolReturnMetadata
	});
	item.action = 'read';
	item.status = HTTP_RESPONSE_STATUS_CODES.OK;
	return item;
}


export default function createOrUpdateMany(
	request: PostRequest
): {
	body?: {
		error: string
	} | any[]
	contentType?: string
	status: number
} {
	// log.debug('request:%s', toStr(request));
	// log.debug('request.params:%s', toStr(request.params));
	// log.debug('request.pathParams:%s', toStr(request.pathParams));

	const {
		body,
		params: {
			documentType: documentTypeParam,
			documentTypeId: documentTypeIdParam,
			partial: partialParam = 'false',
			requireValid: requireValidParam = 'true',
			returnDocument: returnDocumentParam = 'false',
			returnMetadata: returnMetadataParam = 'false'
		} = {},
		pathParams: {
			collectionName = ''
		} = {}
	} = request;
	// log.debug('body:%s', body);
	//log.info(`params:${toStr(params)}`);

	//const d = new Date();
	//const branchDefault = `${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}T${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;


	const boolPartial = partialParam !== 'false'; // Fallsback to false if something invalid is provided
	const boolRequireValid = requireValidParam !== 'false'; // Fallsback to true if something invalid is provided
	const boolReturnDocument = returnDocumentParam !== 'false'; // Fallsback to false if something invalid is provided
	const boolReturnMetadata = returnMetadataParam !== 'false'; // Fallsback to false if something invalid is provided


	// log.debug('collectionName:%s', collectionName);
	if (!collectionName) {
		return {
			body: {
				error: 'Missing required parameter collection!'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	const maybeErrorResponse = authorize(request, collectionName);

	if (maybeErrorResponse.status !== 200 ) {
		return maybeErrorResponse;
	}

	// Cases:
	// 1. Collection does not exist, thus no apiKey either.
	//    So no one can fish for exisiting collections simply respond 400.
	//
	// 2. Collection does exist, but no matching apiKey exists.
	//    So no one can fish for exisiting collections simply respond 400.
	//
	// 3. Collection exist and apiKey matches.
	//    Create or update documents.
	//    TODO: What about removing old documents?
	//
	// 4. apiKey matches in a different collection
	//    We could have been nice and said, wrong or typo in collection name
	//    but for same reasons as 2, letting 2 handle this is the best.

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
				error: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}
	const collectionId = collectionNode._id;

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);
	const branchId = 'master'; // Deliberate hardcode
	runAsSu(() => maybeCreateRepoAndBranch({
		branchId,
		repoId
	}));

	const data = JSON.parse(body);
	// log.debug('data:%s', toStr(data));

	const dataArray = forceArray<BodyItem>(data);
	// log.debug('dataArray:%s', toStr(dataArray));

	return runWithExplorerWrite(() => {
		const writeToCollectionBranchConnection = connect({
			branch: branchId,
			principals: [Principal.EXPLORER_WRITE], // Additional principals to execute the callback with
			repoId//,
			//user // Default is the default user
		});
		const responseArray = [];
		for (let j = 0; j < dataArray.length; j++) {
			try {
				const {
					action,
					document,
					id,
					name,
					path
				} = dataArray[j];
				let {
					documentType,
					documentTypeId,
				} = dataArray[j];
				log.debug('id:%s name:%s path:%s documentType:%s documentTypeId:%s document:%s', id, name, path, documentType, documentTypeId, toStr(document));
				if (!documentTypeId && !documentType) {
					if (documentTypeIdParam) {
						documentTypeId = documentTypeIdParam;
					} else if (documentTypeParam) {
						documentType = documentTypeParam;
					}
				}
				log.debug('documentType:%s documentTypeId:%s', documentType, documentTypeId);

				// CREATE when _id, _name, _path not matched
				// Otherwise MODIFY

				if (id) {
					if (action === 'create') {
						responseArray.push({
							action: 'create',
							error: `id shouldn't be provided when the action is create!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else if (action === 'read') {
						responseArray.push(readDocument({
							boolReturnMetadata,
							id,
							readFromCollectionBranchConnection: writeToCollectionBranchConnection
						}));
					} else if (action === 'delete') {
						responseArray.push(deleteDocument({
							id,
							writeToCollectionBranchConnection
						}));
					} else if (writeToCollectionBranchConnection.exists(id)) {
						// log.debug(`toPersist._id:${toPersist._id} exists!`);
						modifyDocument({
							boolPartial,
							boolRequireValid,
							boolReturnDocument,
							boolReturnMetadata,
							collectionId,
							collectionName,
							document,
							documentType,
							documentTypeId,
							id,
							responseArray,
						});
					} else {
						responseArray.push({
							action: 'update',
							error: `Document with id "${id}" doesn't exist!`,
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						});
					}
				} else if (name) {
					if (action === 'create') {
						responseArray.push({
							action: 'create',
							error: `name shouldn't be provided when the action is create!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else if (action === 'read') {
						responseArray.push(readDocument({
							boolReturnMetadata,
							id: `/${name}`,
							readFromCollectionBranchConnection: writeToCollectionBranchConnection
						}));
					} else if (action === 'delete') {
						responseArray.push(deleteDocument({
							id: `/${name}`,
							writeToCollectionBranchConnection
						}));
					} else if (writeToCollectionBranchConnection.exists(`/${name}`)) {
						// log.debug(`toPersist._name:${toPersist._name} exists!`);
						modifyDocument({
							boolPartial,
							boolRequireValid,
							boolReturnDocument,
							boolReturnMetadata,
							collectionId,
							collectionName,
							document,
							documentType,
							documentTypeId,
							id: `/${name}`,
							responseArray,
						});
					} else {
						responseArray.push({
							action: 'update',
							error: `Document with name "${name}" doesn't exist!`,
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						});
					}
				} else if (path) {
					if (action === 'create') {
						responseArray.push({
							action: 'create',
							error: `path shouldn't be provided when the action is create!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else if (action === 'read') {
						responseArray.push(readDocument({
							boolReturnMetadata,
							id: path,
							readFromCollectionBranchConnection: writeToCollectionBranchConnection
						}));
					} else if (action === 'delete') {
						responseArray.push(deleteDocument({
							id: path,
							writeToCollectionBranchConnection
						}));
					} else if (writeToCollectionBranchConnection.exists(path)) {
						// log.debug(`toPersist._path:${toPersist._path} exists!`);
						modifyDocument({
							boolPartial,
							boolRequireValid,
							boolReturnDocument,
							boolReturnMetadata,
							collectionId,
							collectionName,
							document,
							documentType,
							documentTypeId,
							id: path,
							responseArray,
						});
					} else {
						responseArray.push({
							action: 'update',
							error: `Document with path "${path}" doesn't exist!`,
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						});
					}
				} else {
					// log.debug(`No _id, _name or _path! action:"%s"`, action);
					if (action === 'update') {
						responseArray.push({
							action: 'update',
							error: `id, name or path required when action is update!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else if (action === 'read') {
						responseArray.push({
							action: 'read',
							error: `id, name or path required when action is read!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else if (action === 'delete') {
						responseArray.push({
							action: 'delete',
							error: `id, name or path required when action is delete!`,
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					} else {
						createDocument({
							boolRequireValid,
							boolReturnDocument,
							boolReturnMetadata,
							collectionId,
							collectionName,
							document,
							documentType,
							documentTypeId,
							responseArray,
						});
					}
				}
			} catch (e) {
				// log.error(`e:${toStr(e)}`, e);
				// log.error(`e.message:${toStr(e.message)}`, e.message);
				// log.error(`e.name:${toStr(e.name)}`, e.name);
				// log.error(`e.class:${toStr(e.class)}`, e.class); // Undefined
				if (e.class && e.class.name === 'java.time.format.DateTimeParseException') {
					log.error(e);
					responseArray.push({
						error: e.message
					});
				} else if (e.class && e.class.name === 'java.lang.IllegalArgumentException' && e.message.includes('geo-point')) {
					log.error(e);
					responseArray.push({
						error: e.message
					});
				//} else if (e instanceof ValidationError) { // TypeError: Cannot read property "name" from undefined
				} else if (e.name === 'ValidationError') {
					log.error(e);
					responseArray.push({
						error: e.message
					});
				} else {
					log.error(`Unknown error: message:${toStr(e.message)}`, e);
					responseArray.push({
						error: 'Unknown error. The stacktrace has been logged.'
					});
				}
			} // try ... catch
		} // for
		return {
			body: responseArray,
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.OK
		};
	});
} // export function post
