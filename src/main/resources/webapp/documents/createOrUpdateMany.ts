//import type {RepoConnection} from '@enonic-types/lib-explorer';
import type { Request } from '../../types/Request';


import {
	APP_EXPLORER,
	BRANCH_ID_EXPLORER,
	COLLECTION_REPO_PREFIX,
	Path,
	Principal,
	Repo
} from '@enonic/explorer-utils';
import {
	array,
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
import runWithExplorerWrite from './runWithExplorerWrite';


const {includes: arrayIncludes} = array;


export type PostRequest = Request<{
	collection?: string
	partial?: string
	requireValid?: string
}, {
	collection?: string
}>


const COLLECTOR_ID = `${APP_EXPLORER}:documentRestApi`;
const COLLECTOR_VERSION = app.version;


function createDocument<
	Node extends {
		_id: string
		error?: string
	}
>({
	boolRequireValid = true,
	collectionId,
	collectionName,
	idField,
	responseArray,
	toPersist
}: {
	collectionId: string
	collectionName: string
	responseArray: Node[]
	toPersist: Node
	// Optional
	boolRequireValid?: boolean
	idField?: string
}) {
	const createdNode = create({
		collectionId,
		collectionName,
		collectorId: COLLECTOR_ID,
		collectorVersion: COLLECTOR_VERSION,
		data: toPersist,
		requireValid: boolRequireValid
	});
	if(createdNode) {
		const responseNode = {} as Node;
		if (idField) {
			responseNode[idField] = createdNode[idField];
		} else {
			responseNode._id = createdNode._id;
		}
		responseArray.push(responseNode);
	} else {
		responseArray.push({
			error: 'Something went wrong when trying to create the document!'
		} as Node);
	}
}

export function modifyDocument<
	Node extends {
		_id: string
		error?: string
	}
>({
	collectionId,
	collectionName,
	id,
	responseArray,
	toPersist,
	//user
	// Optional
	boolPartial = false,
	boolRequireValid = true,
	idField
}: {
	collectionId: string
	collectionName: string
	id: string
	responseArray: Node[]
	toPersist: Node
	// Optional
	boolPartial?: boolean
	boolRequireValid?: boolean
	idField?: string
}) {
	const updatedNode = update({
		collectionId,
		collectionName,
		collectorId: COLLECTOR_ID,
		collectorVersion: COLLECTOR_VERSION,
		data: {
			_id: id,
			...toPersist
		},
		partial: boolPartial,
		requireValid: boolRequireValid
	});
	//log.info(`updatedNode:${toStr(updatedNode)}`);
	if(updatedNode) {
		const responseNode = {} as Node;
		if (idField) {
			responseNode[idField] = updatedNode[idField];
		} else {
			responseNode._id = updatedNode._id;
		}
		responseArray.push(responseNode);
	} else {
		responseArray.push({
			error: 'Something went wrong when trying to modify the document!'
		} as Node);
	}
}


export default function createOrUpdateMany(
	request: PostRequest
): {
	body?: {
		message: string
	} | any[]
	contentType?: string
	status: number
} {
	log.debug('request:%s', toStr(request));
	//const user = getUser();
	//log.info(`user:${toStr(user)}`);

	/*if (!(
		hasRole(ROLE_SYSTEM_ADMIN)
		|| hasRole(ROLE_EXPLORER_ADMIN)
		|| hasRole(ROLE_EXPLORER_WRITE)
	)) {
		return {
			status: 403
		};
	}*/

	const {
		body,
		params: {
			collection: collectionParam = '',
			partial: partialParam = 'false',
			requireValid: requireValidParam = 'true'
		} = {},
		pathParams: {
			collection: collectionName = collectionParam
		} = {}
	} = request;
	//log.info(`body:${toStr(body)}`);
	//log.info(`params:${toStr(params)}`);

	//const d = new Date();
	//const branchDefault = `${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}T${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;

	//log.info(`collectionName:${toStr(collectionName)}`);

	const boolRequireValid = requireValidParam !== 'false'; // Thus fallsback to true if something invalid provided
	const boolPartial = partialParam === 'true'; // Thus fallsback to false if something invalid provided

	if (!collectionName) {
		return {
			body: {
				message: 'Missing required parameter collection!'
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
				message: 'Bad Request'
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
	//log.info(`data:${toStr(data)}`);

	const dataArray = forceArray(data);
	//log.info(`dataArray:${toStr(dataArray)}`);

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
				const toPersist = dataArray[j];

				// CREATE when idfield, _id, _name, _path not matched
				// Otherwise MODIFY

				if (toPersist._id) {
					if (writeToCollectionBranchConnection.exists(toPersist._id)) {
						modifyDocument({
							boolPartial,
							boolRequireValid,
							collectionId,
							collectionName,
							id: toPersist._id,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							collectionId,
							collectionName,
							responseArray,
							toPersist
						});
					}
				} else if (toPersist._name) {
					if (writeToCollectionBranchConnection.exists(`/${toPersist._name}`)) {
						modifyDocument({
							boolPartial,
							boolRequireValid,
							collectionId,
							collectionName,
							id: `/${toPersist._name}`,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							collectionId,
							collectionName,
							responseArray,
							toPersist
						});
					}
				} else if (toPersist._path) {
					if (writeToCollectionBranchConnection.exists(toPersist._path)) {
						modifyDocument({
							boolPartial,
							boolRequireValid,
							collectionId,
							collectionName,
							id: toPersist._path,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							collectionId,
							collectionName,
							responseArray,
							toPersist
						});
					}
				} else {
					createDocument({
						boolRequireValid,
						collectionId,
						collectionName,
						responseArray,
						toPersist
					});
				}
			} catch (e) {
				//log.error(`e:${toStr(e)}`, e);
				//log.error(`e.message:${toStr(e.message)}`, e.message);
				//log.error(`e.name:${toStr(e.name)}`, e.name);
				//log.error(`e.class:${toStr(e.class)}`, e.class); // Undefined
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
					log.error('Unknown error', e);
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
