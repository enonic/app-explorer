/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/
import {toStr} from '@enonic/js-utils';

import {get} from '/lib/explorer/api/v1/documents/get';
import {post} from '/lib/explorer/api/v1/documents/post';
import {remove} from '/lib/explorer/api/v1/documents/remove';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {hash} from '/lib/explorer/string/hash';
import {connect} from '/lib/explorer/repo/connect';


const AUTH_PREFIX = 'Explorer-Api-Key ';


export function all(request) {
	//log.info(`request:${toStr(request)}`);

	const {
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		},
		method
	} = request;
	//log.info(`method:${toStr(method)}`);

	if(!authorization) {
		log.error(`Authorization header missing!`);
		return {status: 401}; // Unauthorized
	}
	if(!authorization.startsWith(AUTH_PREFIX)) {
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
	log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

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
		}
	});
	log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`Unique apiKey:${apiKey} not found!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKeyNode = explorerRepoReadConnection.get(matchingApiKeys.hits[0].id);
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	const {collections} = apiKeyNode;
	log.debug(`collections:${toStr(collections)}`);

	if (method === 'GET') {
		return get(request, collections, apiKey);
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
