import type {
	EnonicXpRequest,
	Headers
} from '@enonic-types/lib-explorer/Request.d';
import {GraphQLContext} from '/lib/explorer/interface/graphql/output/index.d';
import type {
	ApiKeyNode,
	EmptyObject
} from '../../types';


import 'reflect-metadata'; // Must be imported only once per WebPack Bundle (Required by setIn)
import {HTTP_HEADERS} from '@enonic/explorer-utils/src'; // Adding "src" fixes the empty AbstractParser error
import {
	RESPONSE_TYPE_JSON,
	// toStr,
} from '@enonic/js-utils';
import lcKeys from '@enonic/js-utils/object/lcKeys';
//@ts-ignore
import {execute} from '/lib/graphql';
import {exists as interfaceExists} from '/lib/explorer/interface/exists';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {hash} from '/lib/explorer/string/hash';
import {connect} from '/lib/explorer/repo/connect';

//import {generateSchemaForInterface} from './schemaWithLimitedDocumentTypes/generateSchemaForInterface';
import {getCachedSchema} from '/lib/explorer/interface/graphql/getCachedSchema';


export type InterfaceRequest = EnonicXpRequest<EmptyObject>


const AUTHORIZATION_PREFIX = 'Explorer-Api-Key ';


function isUnauthorized({
	interfaceName,
	request
} :{
	interfaceName: string
	request: EnonicXpRequest
}) {
	//log.debug('isUnauthorized interfaceName:%s request:%s', interfaceName, toStr(request));
	const {
		 // HTTP/2 uses lowercase header keys
		'authorization': authorization//, // 'Explorer-Api-Key XXXX
	} = lcKeys(request.headers) as Headers;
	//log.debug(`authorization:${toStr(authorization)}`);
	if(!authorization) {
		log.error(`Authorization header missing!`);
		return { status: 401 }; // Unauthorized
	}
	if(!authorization.startsWith(AUTHORIZATION_PREFIX)) {
		log.error(`Invalid Authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKey = authorization.substring(AUTHORIZATION_PREFIX.length);
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
	//log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`API key hashedApiKey:${hashedApiKey} not found!`);
		return {
			body: {
				//message: 'Bad Request'
				message: 'Unauthorized'
			},
			contentType: 'text/json;charset=utf-8',
			//status: 400 // Bad Request
			status: 401 // Unauthorized
		};
	}
	const apiKeyNode = explorerRepoReadConnection.get<ApiKeyNode>(matchingApiKeys.hits[0].id);
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	let {interfaces = []} = apiKeyNode;
	if (!Array.isArray(interfaces)) { interfaces = [interfaces]; }
	//log.debug(`interfaces:${toStr(interfaces)}`);
	if (!interfaces.includes(interfaceName)) {
		log.error(`API key hashedApiKey:${hashedApiKey} doesn't have read access to interface:${interfaceName}!`);
		return {
			body: {
				//message: 'Bad Request'
				message: 'Unauthorized'
			},
			contentType: 'text/json;charset=utf-8',
			//status: 400 // Bad Request
			status: 401 // Unauthorized
		};
	}
	//log.debug(`interfaceName:${toStr(interfaceName)}`);
	if (!interfaceExists({
		connection: explorerRepoReadConnection,
		name: interfaceName
	})) {
		log.error(`interface:${interfaceName} doesn't exist!`);
		return {status: 404}; // Not Found
	}
	return false; // Authorized
} // isUnauthorized


export function overrideable(request: InterfaceRequest, fn = isUnauthorized) {
	// log.debug('overrideable request:%s', toStr(request));

	const {
		body: bodyJson = '{}',
	} = request;

	const { // HTTP/2 uses lowercased header keys
		[HTTP_HEADERS.EXPLORER_INTERFACE_NAME]: interfaceName,
		'explorer-log-query': logQueryHeader, // '1'
		'explorer-log-synonyms-query': logSynonymsQueryHeader, // '1'
		'explorer-log-synonyms-query-result': logSynonymsQueryResultHeader // '1'
	} = lcKeys(request.headers) as Headers;

	if (!interfaceName) {
		log.error(`interfaceName not provided!`);
		return {status: 404}; // Not Found
	}

	const unauthorized = fn({
		interfaceName,
		request
	});

	if (unauthorized) { return unauthorized; }

	const body = JSON.parse(bodyJson);
	const {query, variables} = body;
	//log.debug('query:%s', query);
	//log.debug(`variables:${toStr(variables)}`);
	const context: GraphQLContext = {
		interfaceName,
		logQuery: logQueryHeader === '1',
		logSynonymsQuery: logSynonymsQueryHeader === '1',
		logSynonymsQueryResult: logSynonymsQueryResultHeader === '1'//,
		//query
	};
	//log.debug(`context:${toStr(context)}`);

	const schema = getCachedSchema();

	return {
		contentType: RESPONSE_TYPE_JSON,
		//body: JSON.stringify(execute(generateSchemaForInterface(interfaceName), query, variables, context))
		body: JSON.stringify(execute(schema, query, variables, context))
	};
}


export function post(request: InterfaceRequest) {
	//log.debug('post request:%s', toStr(request));
	return overrideable(request, isUnauthorized);
}
