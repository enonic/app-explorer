import type {
	EnonicXpRequest,
	Headers
} from '@enonic-types/lib-explorer/Request.d';
import type { Response } from '@enonic-types/lib-explorer/Response.d';
import {GraphQLContext} from '/lib/explorer/interface/graphql/output/index.d';
import type {
	ApiKeyNode,
	EmptyObject
} from '../../types';

// These imports works when treeshake: false, but gives error when treeshake: true
// ReferenceError: "Reflect" is not defined
// Must be imported only once per WebPack Bundle (Required by setIn)
import 'core-js/stable/reflect';
// import 'reflect-metadata';

// Adding "src" fixes the empty AbstractParser error
// But it breaks jest :(
// import {HTTP_HEADERS} from '@enonic/explorer-utils/src';
import {HTTP_HEADERS} from '@enonic/explorer-utils';

import { RESPONSE_TYPE_JSON } from '@enonic/js-utils';
// import { toStr } from '@enonic/js-utils/value/toStr';
import lcKeys from '@enonic/js-utils/object/lcKeys';

//@ts-ignore
import {execute} from '/lib/graphql';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {hash} from '/lib/explorer/string/hash';
import {connect} from '/lib/explorer/repo/connect';

//import {generateSchemaForInterface} from './schemaWithLimitedDocumentTypes/generateSchemaForInterface';
import {getCachedSchema} from '/lib/explorer/interface/graphql/getCachedSchema';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';


export type InterfaceRequest = EnonicXpRequest<EmptyObject>


const AUTHORIZATION_PREFIX = 'Explorer-Api-Key ';


function authorize({
	request
}: {
	request: EnonicXpRequest
}): Response {
	// log.debug('isUnauthorized interfaceName:%s request:%s', interfaceName, toStr(request));
	const {
		 // HTTP/2 uses lowercase header keys
		'authorization': authorization//, // 'Explorer-Api-Key XXXX
	} = lcKeys(request.headers) as Headers;
	// log.debug(`authorization:${toStr(authorization)}`);
	if(!authorization) {
		log.error(`Authorization header missing!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.UNAUTHORIZED };
	}
	if(!authorization.startsWith(AUTHORIZATION_PREFIX)) {
		log.error(`Invalid Authorization header:${authorization}!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST };
	}
	const apiKey = authorization.substring(AUTHORIZATION_PREFIX.length);
	// log.debug(`apiKey:${toStr(apiKey)}`);
	if (!apiKey) {
		log.error(`ApiKey not found in Authorization header:${authorization}!`);
		return { status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST };
	}
	const hashedApiKey = hash(apiKey);
	// log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const matchingApiKeys = explorerRepoReadConnection.query({
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'key',
						values: [hashedApiKey]
					}
				},{
					hasValue: {
						field: '_nodetype',
						values: [NT_API_KEY]
					}
				}]
			}
		},
		query: ''
	});
	// log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`API key hashedApiKey:${hashedApiKey} not found!`);
		return {
			body: JSON.stringify({
				error: 'Forbidden'
			}),
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.FORBIDDEN
		};
	}
	// log.debug('matchingApiKeys.hits[0].id:%s', matchingApiKeys.hits[0].id);

	const apiKeyNode = explorerRepoReadConnection.get<ApiKeyNode>(matchingApiKeys.hits[0].id);
	// log.debug('apiKeyNode:%s', toStr(apiKeyNode));
	let {interfaces = []} = apiKeyNode;
	if (!Array.isArray(interfaces)) { interfaces = [interfaces]; }
	// log.debug(`interfaces:${toStr(interfaces)}`);

	return { // Authorized
		body: JSON.stringify({
			allowedInterfaces: interfaces,
		}),
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	}
} // authorize


export function overrideable(request: InterfaceRequest, fn = authorize): Response {
	// log.debug('overrideable request:%s', toStr(request));

	const {
		body: bodyJson = '{}',
	} = request;

	const { // HTTP/2 uses lowercased header keys
		[HTTP_HEADERS.EXPLORER_INTERFACE_NAME]: interfaceName,
		'explorer-log-query': logQueryHeader, // '1'
		'explorer-log-query-result': logQueryResultHeader, // '1'
		'explorer-log-synonyms-query': logSynonymsQueryHeader, // '1'
		'explorer-log-synonyms-query-result': logSynonymsQueryResultHeader // '1'
	} = lcKeys(request.headers) as Headers;

	const maybeResponse = fn({
		// interfaceName,
		request
	});

	if (maybeResponse && maybeResponse.status !== 200 ) {
		return maybeResponse;
	}

	const { allowedInterfaces = [] } = JSON.parse(maybeResponse.body);
	// log.debug('allowedInterfaces:%s', toStr(allowedInterfaces));

	const requestBody = JSON.parse(bodyJson);
	const {query, variables} = requestBody;
	// log.debug('query:%s', query);
	// log.debug(`variables:${toStr(variables)}`);
	const context: GraphQLContext = {
		allowedInterfaces,
		interfaceName,
		logQuery: logQueryHeader === '1',
		logQueryResult: logQueryResultHeader === '1',
		logSynonymsQuery: logSynonymsQueryHeader === '1',
		logSynonymsQueryResult: logSynonymsQueryResultHeader === '1'//,
		//query
	};
	// log.debug('context:%s', toStr(context));

	const schema = getCachedSchema();

	return {
		body: JSON.stringify(execute(schema, query, variables, context)),
		contentType: RESPONSE_TYPE_JSON,
		status: 200
	};
} // overrideable


export function post(request: InterfaceRequest): Response {
	// log.debug('post request:%s', toStr(request));
	const response = overrideable(request, authorize);
	// log.debug('post response:%s', toStr(response));
	return response;
}
