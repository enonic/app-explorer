// import type { EnonicXpRequest } from '@enonic-types/lib-explorer';
import type { DocumentNode } from '/lib/explorer/types/Document';
import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	// NodeType,
	Principal
} from '@enonic/explorer-utils';
import { forceArray } from '@enonic/js-utils/array/forceArray';
import { startsWith } from '@enonic/js-utils/string/startsWith';
import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import stripDocumentNode from './stripDocumentNode';


export type GetManyRequest = Request<{
	collection?: string
	id: string|string[]
},{
	collectionName?: string
}>


export default function getMany(request: GetManyRequest) {
	// log.debug('getMany request:%s', toStr(request));

	const {
		params: {
			id: idParam = ''
		} = {},
		pathParams: {
			collectionName = '',
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

	if (!idParam) {
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
	//log.info(`repoId:${toStr(repoId)}`);
	const connectParams = {
		branch: 'master', // Deliberate hardcode,
		principals: [Principal.EXPLORER_READ],
		repoId
	};
	//log.debug('connecting using:%s', toStr(connectParams));
	let readFromCollectionBranchConnection: ReturnType<typeof connect>;
	try {
		readFromCollectionBranchConnection = connect(connectParams);
	} catch (e) {
		if (
			e.class && e.class.name === 'java.lang.IllegalArgumentException'
			&& startsWith(e.message, 'RepositoryId format incorrect')
		) {
			return {
				body: {
					error: `Collection format incorrect:${collectionName}!`
				},
				status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
			};
		}
		log.error('stacktrace', e);
		// log.error(`e.message:${toStr(e.message)}`, e.message);
		return {
			body: {
				error: `Failed to read from collection:${collectionName}!`
			},
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		};
	}
	//log.debug('connected using:%s', toStr(connectParams));

	const ids = forceArray(idParam);
	const strippedDocumentNodes = [];
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		const documentNode = readFromCollectionBranchConnection.get<DocumentNode>(id);
		// log.debug('documentNode:%s', toStr(documentNode));

		if (!documentNode) {
			log.error('Document with id:%s not found in collection:%s!', id, collectionName);
		} else {
			const strippedDocumentNode = stripDocumentNode(documentNode);
			// log.debug('strippedDocumentNode:%s', toStr(strippedDocumentNode));
			strippedDocumentNodes.push(strippedDocumentNode);
		}
	} // for ids

	if (!strippedDocumentNodes.length) {
		return {
			body: {
				error: `Didn't find any documents for ids:${ids.join(',')}`
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
		}
	}

	return {
		body: strippedDocumentNodes,
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}
