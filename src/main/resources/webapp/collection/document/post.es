import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	PRINCIPAL_EXPLORER_WRITE/*,
	ROLE_EXPLORER_ADMIN,
	ROLE_EXPLORER_WRITE,
	ROLE_SYSTEM_ADMIN*/
} from '/lib/explorer/model/2/constants';
import {USER as EXPLORER_APP_USER} from '/lib/explorer/model/2/users/explorer';
//import {Document} from '/lib/explorer/model/2/nodeTypes/document';
//import {get as getCollection} from '/lib/explorer/collection/get';
//import {createOrModify} from '/lib/explorer/node/createOrModify';
import {connect} from '/lib/explorer/repo/connect';
import {maybeCreate as maybeCreateRepoAndBranch} from '/lib/explorer/repo/maybeCreate';
import {runAsSu} from '/lib/explorer/runAsSu';
import {create/*, ValidationError*/} from '/lib/explorer/document/create';
import {update} from '/lib/explorer/document/update';
import {
	getUser/*,
	hasRole*/
} from '/lib/xp/auth';
import {run} from '/lib/xp/context';


function createDocument({
	boolRequireValid = true,
	connection,
	idField,
	responseArray,
	toPersist
}) {
	const createdNode = create(toPersist, {
		boolRequireValid,
		connection
	});
	if(createdNode) {
		const responseNode = {};
		if (idField) {
			responseNode[idField] = createdNode[idField];
		} else {
			responseNode._id = createdNode._id;
		}
		responseArray.push(responseNode);
	} else {
		responseArray.push({
			error: 'Something went wrong when trying to create the document!'
		});
	}
}

function modifyDocument({
	boolPartial = false,
	boolRequireValid = true,
	connection,
	id,
	idField,
	responseArray,
	toPersist//,
	//user
}) {
	const updatedNode = update({
		_id: id,
		...toPersist
	}, {
		boolPartial,
		boolRequireValid,
		connection
	});
	//log.info(`updatedNode:${toStr(updatedNode)}`);
	if(updatedNode) {
		const responseNode = {};
		if (idField) {
			responseNode[idField] = updatedNode[idField];
		} else {
			responseNode._id = updatedNode._id;
		}
		responseArray.push(responseNode);
	} else {
		responseArray.push({
			error: 'Something went wrong when trying to modify the document!'
		});
	}
}


export function post(request, collections = []) {
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
			status: 400 // Bad Request
		};
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
	runAsSu(() => maybeCreateRepoAndBranch({
		branchId,
		repoId
	}));

	const data = JSON.parse(body);
	//log.info(`data:${toStr(data)}`);

	const dataArray = forceArray(data);
	//log.info(`dataArray:${toStr(dataArray)}`);

	let user = getUser();
	if (!user) {
		// CreateNode tries to set owner, and fails when no user
		user = {
			displayName: EXPLORER_APP_USER.displayName,
			disabled: false,
			idProvider: EXPLORER_APP_USER.idProvider, // 'system',
			key: `user:${EXPLORER_APP_USER.idProvider}:${EXPLORER_APP_USER.name}`, // `user:system:${USER_EXPLORER_APP_NAME}`,
			login: EXPLORER_APP_USER.name, //USER_EXPLORER_APP_NAME,
			type: 'user'
		};
		//log.info(`user:${toStr(user)}`);
	}

	return run({
		//principals: [PRINCIPAL_EXPLORER_WRITE], // This allows any user to write
		user
	}, () => {
		const writeToCollectionBranchConnection = connect({
			branch: branchId,
			principals: [PRINCIPAL_EXPLORER_WRITE], // Additional principals to execute the callback with
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
							connection: writeToCollectionBranchConnection,
							id: toPersist._id,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							connection: writeToCollectionBranchConnection,
							responseArray,
							toPersist
						});
					}
				} else if (toPersist._name) {
					if (writeToCollectionBranchConnection.exists(`/${toPersist._name}`)) {
						modifyDocument({
							boolPartial,
							boolRequireValid,
							connection: writeToCollectionBranchConnection,
							id: `/${toPersist._name}`,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							connection: writeToCollectionBranchConnection,
							responseArray,
							toPersist
						});
					}
				} else if (toPersist._path) {
					if (writeToCollectionBranchConnection.exists(toPersist._path)) {
						modifyDocument({
							boolPartial,
							boolRequireValid,
							connection: writeToCollectionBranchConnection,
							id: toPersist._path,
							responseArray,
							toPersist
						});
					} else {
						createDocument({
							boolRequireValid,
							connection: writeToCollectionBranchConnection,
							responseArray,
							toPersist
						});
					}
				} else {
					createDocument({
						boolRequireValid,
						connection: writeToCollectionBranchConnection,
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
			contentType: 'text/json;charset=utf-8'
		};
	}); // libContext.run
} // export function post
