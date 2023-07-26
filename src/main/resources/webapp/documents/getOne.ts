// import type { EnonicXpRequest } from '@enonic-types/lib-explorer';
import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	Principal
} from '@enonic/explorer-utils';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';


export default function getOne(request: Request<{
    collection?: string
    id?: string
},{
    collectionName?: string
    documentId?: string
}>) {
    // log.debug('getOne request:%s', toStr(request));

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
	//log.info(`repoId:${toStr(repoId)}`);
    const connectParams = {
		branch: 'master', // Deliberate hardcode,
		principals: [Principal.EXPLORER_READ],
		repoId
	};
	//log.debug('connecting using:%s', toStr(connectParams));
	const readFromCollectionBranchConnection = connect(connectParams);
	//log.debug('connected using:%s', toStr(connectParams));

    const documentNode = readFromCollectionBranchConnection.get(documentId);
    // log.debug('documentNode:%s', toStr(documentNode));

    if (!documentNode) {
        return {
            status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
        }
    }

    const strippedDocumentNode = {};
    // Not allowed to see any underscore fields (except _id, _name, _path)
    Object.keys(documentNode).forEach((k) => {
        if (
            !startsWith(k, '_')
            || k === '_id'
            || k === '_name'
            || k === '_path'
        ) {
            strippedDocumentNode[k] = documentNode[k];
        }
    });
	// log.debug('strippedDocumentNode:%s', toStr(strippedDocumentNode));

	return {
		body: strippedDocumentNode,
		contentType: 'text/json;charset=utf-8',
        status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}