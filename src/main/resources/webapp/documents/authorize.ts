import type { Headers } from '@enonic-types/lib-explorer/Request.d';
import type { Request } from '../../types/Request';


import {
	NodeType,
	Principal,
	Role
} from '@enonic/explorer-utils';
import { forceArray } from '@enonic/js-utils/array/forceArray';
import { includes as arrayIncludes } from '@enonic/js-utils/array/includes';
import lcKeys from '@enonic/js-utils/object/lcKeys';
import { startsWith } from '@enonic/js-utils/string/startsWith';
import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { hash } from '/lib/explorer/string/hash';
import { hasRole } from '/lib/xp/auth';
import { coerceApiKey } from '../../services/graphQL/apiKey/coerceApiKey';
import {
	AUTH_PREFIX,
	HTTP_RESPONSE_STATUS_CODES
} from '../constants';


export default function authorize(request: Request, collectionName: string): {
	body?: {
		message: string
	}
	contentType?: string
	status: number
} {
	//log.info(`request:${toStr(request)}`);

	if (
		hasRole(Role.SYSTEM_ADMIN)
		|| hasRole(Role.EXPLORER_ADMIN)
		// || hasRole(Role.EXPLORER_READ) // Only for documentation, getOne and query
		|| hasRole(Role.EXPLORER_WRITE)
	) {
		return { // Authorized
			// body: JSON.stringify({}),
			// contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.OK
		};
	}

	const { // HTTP/2 uses lowercase header keys
		'authorization': authorization // 'Explorer-Api-Key XXXX'
	} = lcKeys(request.headers || {}) as Headers;


	if(!authorization) {
		log.error(`Authorization header missing!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.UNAUTHORIZED };
	}
	if(!startsWith(authorization, AUTH_PREFIX)) {
		log.error(`Invalid Authorization header:${authorization}!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST };
	}
	const apiKey = authorization.substring(AUTH_PREFIX.length);
	// log.debug('apiKey:%s', apiKey);
	if (!apiKey) {
		log.error(`ApiKey not found in Authorization header:${authorization}!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST };
	}
	const hashedApiKey = hash(apiKey);
	//log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

	const explorerRepoReadConnection = connect({ principals: [Principal.EXPLORER_READ] });
	const matchingApiKeys = explorerRepoReadConnection.query({
		count: -1,
		// filters: { // Filters are not implemented in @enonic/mock-xp yet.
		// 	boolean: {
		// 		must: {
		// 			hasValue: {
		// 				field: 'key',
		// 				values: [hashedApiKey]
		// 			}
		// 		},
		// 		should: [{
		// 			hasValue: {
		// 				field: '_nodetype',
		// 				values: [NodeType.API_KEY]
		// 			}
		// 		},{
		// 			hasValue: {
		// 				field: 'type',
		// 				values: [NodeType.API_KEY]
		// 			}
		// 		}]
		// 	}
		// },
		query: {
			boolean: {
				must: {
					term: {
						field: 'key',
						value: hashedApiKey
					}
				},
				should: [{
					term: {
						field: '_nodetype',
						value: NodeType.API_KEY
					}
				},{
					term: {
						field: 'type',
						value: NodeType.API_KEY
					}
				}]
			}
		}
	});
	// log.debug('matchingApiKeys:%s', toStr(matchingApiKeys));

	if(matchingApiKeys.total !== 1) {
		log.error(`Unique API key hashedApiKey:${hashedApiKey} not found!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.FORBIDDEN };
	}

	const apiKeyNode = coerceApiKey(explorerRepoReadConnection.get(matchingApiKeys.hits[0].id));
	// log.debug('apiKeyNode:%s', toStr(apiKeyNode));

	const {
		collections,
		_name: apiKeyName
	} = apiKeyNode;
	// log.debug('collections:%s', toStr(collections));

	if (
		!collections
		|| !collections.length // Works for both string and array
	) {
		log.error(`The API key with name:${apiKeyName} doesn't have access to any collections!`);
		return {
			body: {
				message: "The API key doesn't have access to any collections!"
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	if (collectionName && !arrayIncludes(forceArray(collections), collectionName)) {
		log.error(`No access to collection:${collectionName}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	return { // Authorized
		// body: JSON.stringify({}),
		// contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
} // authorize
