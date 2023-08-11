// import type { EnonicXpRequest } from '@enonic-types/lib-explorer';
import type { DocumentNode } from '/lib/explorer/types/Document';
import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	Principal,
	Role
} from '@enonic/explorer-utils';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { hasRole } from '/lib/xp/auth';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import documentNodeToBodyItem from './documentNodeToBodyItem';


export type GetOneRequest = Request<{
	collection?: string
	id?: string
	returnMetadata?: 'true'|'false'
},{
	collectionName?: string
	documentId?: string
}>

export default function getOne(request: GetOneRequest) {
	// log.debug('getOne request:%s', toStr(request));

	const {
		params: {
			id: idParam = '',
			returnMetadata: returnMetadataParam = 'false'
		} = {},
		pathParams: {
			collectionName = '',
			documentId = idParam
		} = {}
	} = request;

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

	if (!hasRole(Role.EXPLORER_READ)) {
		const maybeErrorResponse = authorize(request, collectionName);

		if (maybeErrorResponse.status !== 200 ) {
			return maybeErrorResponse;
		}
	}

	const boolReturnMetadata = returnMetadataParam !== 'false'; // Fallsback to false if something invalid is provided

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);
	const connectParams = {
		branch: 'master', // Deliberate hardcode,
		principals: [Principal.EXPLORER_READ],
		repoId
	};
	//log.debug('connecting using:%s', toStr(connectParams));
	const readFromCollectionBranchConnection = connect(connectParams);
	//log.debug('connected using:%s', toStr(connectParams));

	const documentNode = readFromCollectionBranchConnection.get<DocumentNode>(documentId);
	// log.debug('documentNode:%s', toStr(documentNode));

	if (!documentNode) {
		return {
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}

	const body = documentNodeToBodyItem({
		documentNode,
		includeMetadata: boolReturnMetadata
	});
	// log.debug('body:%s', toStr(body));

	return {
		body,
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}
