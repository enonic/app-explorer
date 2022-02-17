import type {Request} from '../../types/Request';


import {
	//RESPONSE_TYPE_JSON,
	RESPONSE_TYPE_HTML,
	forceArray,
	startsWith//,
	//toStr
} from '@enonic/js-utils';

import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';
import {coerceApiKey} from '../../services/graphQL/apiKey/coerceApiKey';


const AUTH_PREFIX = 'Explorer-Api-Key ';


export function listCollections(request :Request) {
	//log.debug(`request:${toStr(request)}`);
	const {
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		}
	} = request;
	if(!authorization) {
		log.error(`Authorization header missing!`);
		return {
			//body: '{}',
			//contentType: RESPONSE_TYPE_JSON,
			status: 401
		}; // Unauthorized
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
		log.error(`Unique apiKey:${apiKey} not found!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKeyNode = coerceApiKey(explorerRepoReadConnection.get(matchingApiKeys.hits[0].id));
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	const {collections} = apiKeyNode;
	//log.debug(`collections:${toStr(collections)}`);
	return {
		body: `<html>
	<head>
		<title>Collections - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Collections</h2>
		<ul>
			<li><a href="/api/v1">..</a></li>
			${forceArray(collections).map((collection) => `<li><a href="/api/v1/collections/${collection}">${collection}</a></li>`)}
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
} // listCollections


export function collectionResponse(request :Request<{}, {
	collection :string
}>) {
	//log.debug(`request:${toStr(request)}`);
	const {
		pathParams: {
			collection
		}
	} = request;
	//log.debug(`collection:${toStr(collection)}`);
	return {
		body: `<html>
	<head>
		<title>Endpoints - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Endpoints</h2>
		<ul>
			<li><a href="/api/v1/collections">..</a></li>
			<li><a href="/api/v1/collections/${collection}/documents">documents</a></li>
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
}
