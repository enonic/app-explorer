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
	DOCUMENT_REST_API_VERSION,
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


const router = Router();

// router.post('/api/graphql', (r: InterfaceRequest) => interfacePost(r));
router.post('/api/graphql/?', (r: InterfaceRequest) => interfacePost(r));
//router.all('/api/graphql', (r :InterfaceRequest) => listInterfaces(r)); // TODO GraphiQL instead

//──────────────────────────────────────────────────────────────────────────────
// Batch/Bulk/Many
//──────────────────────────────────────────────────────────────────────────────

// router.delete(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => deleteMany(r));
router.delete(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/?`, (r: EnonicXpRequest) => deleteMany(r));

// router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => getMany(r));
router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/?`, (r: EnonicXpRequest) => getMany(r));

// router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => createOrUpdateMany(r));
router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/?`, (r: EnonicXpRequest) => createOrUpdateMany(r));

// router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/query`, (r: EnonicXpRequest) => query(r));
router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/query/?`, (r: EnonicXpRequest) => query(r));

//──────────────────────────────────────────────────────────────────────────────
// One/Single
//──────────────────────────────────────────────────────────────────────────────
// router.delete(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => deleteOne(r));
router.delete(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => deleteOne(r));

// router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => getOne(r));
router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => getOne(r));

// router.put(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => put(r));
// router.put(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/`, (r: EnonicXpRequest) => put(r));

// Method PATCH isn't part of the HTTP/1.1 standard.
// It is supported by some frameworks, but currently NOT Enonic XP, NOR lib-router:
// https://github.com/enonic/xp/issues/9131
// https://github.com/enonic/lib-router/issues/108
// router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => patch(r));
router.post(`/api/v${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/?`, (r: EnonicXpRequest) => patch(r));

//──────────────────────────────────────────────────────────────────────────────
// Documentation
//──────────────────────────────────────────────────────────────────────────────
// router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents`, (r: EnonicXpRequest) => documentation(r));
router.get(`/api/v${DOCUMENT_REST_API_VERSION}/documents/?`, (r: EnonicXpRequest) => documentation(r));

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
		<p><a href="/webapp/com.enonic.app.explorer/api/v${DOCUMENT_REST_API_VERSION}/documents">/api/v${DOCUMENT_REST_API_VERSION}/documents</a></p>
		<p><a href="/webapp/com.enonic.app.explorer/api/graphql">/api/graphql</a></p>
	</body>
</html>`,
		contentType: 'text/html;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}

// router.get('', respondToRootRequest);
router.get('/?', respondToRootRequest);

router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
	// log.info('request:%s', toStr(r));
	// "path": "/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",
	// "rawPath": "/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",
	// "url": "http://localhost:8080/webapp/com.enonic.app.explorer/static/semantic-ui-css/themes/default/assets/fonts/icons.ttf",

	const immuteableResponse = immutableGetter(r);
	if (immuteableResponse.status === HTTP_RESPONSE_STATUS_CODES.NOT_FOUND) {
		const path = r.path.split(`/${GETTER_ROOT}/`, 2)[1];
		// log.debug('path:%s', toStr(path));

		const immuteableUrl = getImmuteableUrl({
			manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
			path
		});
		// log.debug('immuteableUrl:%s', toStr(immuteableUrl));

		const postFix = immuteableUrl.split(`/${GETTER_ROOT}/`, 2)[1];
		// log.debug('postFix:%s', toStr(postFix));

		r.path = `${r.path.split(`/${GETTER_ROOT}/`, 2)[0]}/${postFix}`;
		r.rawPath = `${r.rawPath.split(`/${GETTER_ROOT}/`, 2)[0]}/${postFix}`;
		r.url = `${r.url.split(`/${GETTER_ROOT}/`, 2)[0]}/${postFix}`;
		const etagResponse = etagGetter(r);
		// log.debug('etagResponse:%s', toStr(etagResponse));
		return etagResponse;
	} else if (immuteableResponse.status !== HTTP_RESPONSE_STATUS_CODES.OK) {
		log.warning('immuteableResponse:%s', toStr(immuteableResponse));
	}
	return immuteableResponse;
});

export const all = (r: EnonicXpRequest) => router.dispatch(r);
