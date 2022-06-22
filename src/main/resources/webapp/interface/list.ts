import type {EnonicXpRequest} from '/lib/explorer/types/index.d';


import {
	RESPONSE_TYPE_HTML,
	forceArray,
	startsWith,
	toStr
} from '@enonic/js-utils';
import {resolve} from 'uri-js';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';
import {coerceApiKey} from '../../services/graphQL/apiKey/coerceApiKey';
import {AUTH_PREFIX} from '../constants';


export function list(request :EnonicXpRequest) {
	//log.debug('request:%s', toStr(request));
	const {
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		},
		path
	} = request;

	if(!authorization) {
		log.error(`Authorization header missing!`);
		return {
			status: 401 // Unauthorized
		};
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
	//log.debug('apiKeyNode:%s', toStr(apiKeyNode));

	const {interfaces = []} = apiKeyNode;

	const parentHref = resolve(path, '..');
	return {
		body: `<html>
	<head>
		<title>Interfaces - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Interfaces</h2>
		<ul>
			<li><a href="${parentHref}">..</a></li>
			${forceArray(interfaces).map((interfaceName) => `<li><a href="${path}/interface/${interfaceName}">${interfaceName}</a> (GraphQL)</li>`).join('\n')}
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
}
