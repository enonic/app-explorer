import type { Headers } from '@enonic-types/lib-explorer/Request.d';
import type {GetRequest} from './get';
import type {PostRequest} from './post';
import type {RemoveRequest} from './remove';

/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/
import {
	startsWith//,
	//toStr
} from '@enonic/js-utils';
import lcKeys from '@enonic/js-utils/object/lcKeys';
import {get} from './get';
import {post} from './post';
import {remove} from './remove';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {hash} from '/lib/explorer/string/hash';
import {connect} from '/lib/explorer/repo/connect';
import {coerceApiKey} from '../../../services/graphQL/apiKey/coerceApiKey';


export type AllDocumentRequest = GetRequest & PostRequest & RemoveRequest;


const AUTH_PREFIX = 'Explorer-Api-Key ';


export function all(
	request: AllDocumentRequest
) {
	//log.info(`request:${toStr(request)}`);

	const { // HTTP/2 uses lowercase header keys
		'authorization': authorization // 'Explorer-Api-Key XXXX'
	} = lcKeys(request.headers) as Headers;

	const {
		method
	} = request;
	//log.info(`method:${toStr(method)}`);

	if(!authorization) {
		log.error(`Authorization header missing!`);
		return {status: 401}; // Unauthorized
	}
	if(!startsWith(authorization, AUTH_PREFIX)) {
		log.error(`Invalid Authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKey = authorization.substring(AUTH_PREFIX.length);
	//log.debug(`apiKey:${toStr(apiKey)}`);
	if (!apiKey) {
		log.error(`ApiKey not found in Authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const hashedApiKey = hash(apiKey);
	//log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const matchingApiKeys = explorerRepoReadConnection.query({
		count: -1,
		filters: {
			boolean: {
				must: {
					hasValue: {
						field: 'key',
						values: [hashedApiKey]
					}
				},
				should: [{
					hasValue: {
						field: '_nodetype',
						values: [NT_API_KEY]
					}
				},{
					hasValue: {
						field: 'type',
						values: [NT_API_KEY]
					}
				}]
			}
		},
		query: ''
	});
	//log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`Unique apiKey:${apiKey} not found!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKeyNode = coerceApiKey(explorerRepoReadConnection.get(matchingApiKeys.hits[0].id));
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	const {collections} = apiKeyNode;
	//log.debug(`collections:${toStr(collections)}`);

	if (method === 'GET') {
		return get(request, collections/*, apiKey*/);
	} // method === 'GET'

	if (method === 'POST') {
		return post(request, collections);
	} // method === 'POST'

	if (method === 'DELETE') {
		return remove(request, collections);
	} // method === 'DELETE'

	return {
		status: 405 // Method not allowed
	};
}
