/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import type { EnonicXpRequest } from '@enonic-types/lib-explorer';
import type { Request } from '../types/index.d';
import type { InterfaceRequest } from './interface/post';


import '@enonic/nashorn-polyfills';
import { Role } from '@enonic/explorer-utils';
import { toStr } from '@enonic/js-utils/value/toStr';
//@ts-ignore
import Router from '/lib/router';
import { hasRole } from '/lib/xp/auth';
import {
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '../constants';
import {
	DOCUMENT_REST_API_PATH,
	HTTP_RESPONSE_STATUS_CODES
} from './constants';
import {
	createOrUpdateMany,
	deleteOne,
	deleteMany,
	documentation,
	getMany,
	getOne,
	patch,
	// put,
	query
} from './documents';
import etagGetter from './etagGetter';
import getImmuteableUrl from './getImmuteableUrl';
import immutableGetter from './immutableGetter';
import { post as interfacePost } from './interface';


// const LOG_LEVEL = 'info';

const router = Router();

router.post('/api/graphql/?', (r: InterfaceRequest) => interfacePost(r));
//router.all('/api/graphql', (r :InterfaceRequest) => listInterfaces(r)); // TODO GraphiQL instead

//──────────────────────────────────────────────────────────────────────────────
// Batch/Bulk/Many
//──────────────────────────────────────────────────────────────────────────────

router.delete(`${DOCUMENT_REST_API_PATH}/{collectionName}/?`, (r: EnonicXpRequest) => deleteMany(r));

router.get(`${DOCUMENT_REST_API_PATH}/{collectionName}/?`, (r: EnonicXpRequest) => getMany(r));

router.post(`${DOCUMENT_REST_API_PATH}/{collectionName}/?`, (r: EnonicXpRequest) => createOrUpdateMany(r));

router.post(`${DOCUMENT_REST_API_PATH}/{collectionName}/query/?`, (r: EnonicXpRequest) => query(r));

//──────────────────────────────────────────────────────────────────────────────
// One/Single
//──────────────────────────────────────────────────────────────────────────────
router.delete(`${DOCUMENT_REST_API_PATH}/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => deleteOne(r));

router.get(`${DOCUMENT_REST_API_PATH}/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => getOne(r));

// router.put(`${DOCUMENT_REST_API_PATH}/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => put(r));

// Method PATCH isn't part of the HTTP/1.1 standard.
// It is supported by some frameworks, but currently NOT Enonic XP, NOR lib-router:
// https://github.com/enonic/xp/issues/9131
// https://github.com/enonic/lib-router/issues/108
router.post(`${DOCUMENT_REST_API_PATH}/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => patch(r));

//──────────────────────────────────────────────────────────────────────────────
// Documentation
//──────────────────────────────────────────────────────────────────────────────
router.get(`${DOCUMENT_REST_API_PATH}/?`, (r: EnonicXpRequest) => documentation(r));

function respondToRootRequest(/*request: EnonicXpRequest*/) {
	if (!(
		hasRole(Role.SYSTEM_ADMIN)
		|| hasRole(Role.EXPLORER_ADMIN)
		|| hasRole(Role.EXPLORER_READ)
		|| hasRole(Role.EXPLORER_WRITE)
	)) {
		return {
			status: HTTP_RESPONSE_STATUS_CODES.UNAUTHORIZED
		};
	}
	return { // Authorized
		body: `<html>
	<head>
		<title>Explorer Webapp</title>
	</head>
	<body>
		<h1>Explorer Webapp</h1>
		<p>Version: ${app.version}</p>
		<p><a href="/webapp/com.enonic.app.explorer${DOCUMENT_REST_API_PATH}">${DOCUMENT_REST_API_PATH}</a></p>
		<p><a href="/webapp/com.enonic.app.explorer/api/graphql">/api/graphql</a></p>
	</body>
</html>`,
		contentType: 'text/html;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}

router.get('/?', respondToRootRequest);

router.all(`${DOCUMENT_REST_API_PATH}/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
	// log[LOG_LEVEL]('static request:%s', toStr(r));
	// "path": "/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",
	// "rawPath": "/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",
	// "url": "http://localhost:8080/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",
	const path = r.path.split(`/${GETTER_ROOT}/`, 2)[1];
	// log[LOG_LEVEL]('static path:%s', toStr(path)); // react/DocumentsApiDoc-6F3Z3JSZ.mjs

	const immuteableUrl = getImmuteableUrl({
		manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
		path,
		request: r
	});
	// log[LOG_LEVEL]('static immuteableUrl:%s', toStr(immuteableUrl));

	const postFix = immuteableUrl.split(`/${GETTER_ROOT}/`, 2)[1];
	// log[LOG_LEVEL]('static postFix:%s', toStr(postFix));

	if (postFix === 'undefined') {
		const immuteableResponse = immutableGetter(r);
		// log[LOG_LEVEL]('static immuteableResponse:%s', toStr(immuteableResponse));
		if (immuteableResponse.status !== HTTP_RESPONSE_STATUS_CODES.OK) {
			log.warning('static immuteableResponse:%s url:%s', toStr(immuteableResponse), r.url); // This can happen if the file doesn't exist.
		}
		return immuteableResponse;
	} else {
		const modifiedRequest = JSON.parse(JSON.stringify(r)) as typeof r; // dereference
		modifiedRequest.path = `${r.path.split(`/${GETTER_ROOT}/`, 2)[0]}/${GETTER_ROOT}/${postFix}`;
		modifiedRequest.rawPath = `${r.rawPath.split(`/${GETTER_ROOT}/`, 2)[0]}/${GETTER_ROOT}/${postFix}`;
		modifiedRequest.url = `${r.url.split(`/${GETTER_ROOT}/`, 2)[0]}/${GETTER_ROOT}/${postFix}`;
		// log[LOG_LEVEL]('static modifiedRequest:%s', toStr(modifiedRequest));

		const etagResponse = etagGetter(modifiedRequest);
		// log[LOG_LEVEL]('static etagResponse:%s', toStr(etagResponse));

		if (
			etagResponse.status !== HTTP_RESPONSE_STATUS_CODES.OK
			&& etagResponse.status !== HTTP_RESPONSE_STATUS_CODES.NOT_MODIFIED
		) {
			// This probably can't happen.
			log.warning(
				'static etagResponse:%s origUrl:%s modifiedUrl:%s',
				toStr(etagResponse),
				r.url,
				modifiedRequest.url
			);
		}
		return etagResponse;
	}
});

export const all = (r: EnonicXpRequest) => router.dispatch(r);
