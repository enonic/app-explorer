/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import type {EnonicXpRequest} from '/lib/explorer/types/index.d';
import type {GetCollectionRequest} from './collection/get';
import type {AllDocumentRequest} from './collection/document';
import type {InterfaceRequest} from './interface/post';


import '@enonic/nashorn-polyfills';

/*import {
	RESPONSE_TYPE_HTML,
	toStr
} from '@enonic/js-utils';*/

//@ts-ignore
import Router from '/lib/router';
import {
	get as getCollection,
	list as listCollections
} from './collection';
import {all as documentResponse} from './collection/document';
import {
	list as listInterfaces,
	post as interfacePost
} from './interface';
import {
	ROUTER_PATH_COLLECTIONS_API,
	ROUTER_PATH_INTERFACES_API
} from './constants';


const router = Router();

/*router.all('/api', () => ({
	body: `<html>
<head>
	<title>Versions - API documentation</title>
</head>
<body>
	<h1>API documentation</h1>
	<h2>Versions</h2>
	<ul>
		<li><a href="/api/v1">v1</a></li>
	</ul>
</body>
</html>`,
	contentType: RESPONSE_TYPE_HTML
}));
router.all('/api/v1', () => ({
	body: `<html>
<head>
	<title>Version 1 - API documentation</title>
</head>
<body>
	<h1>API documentation</h1>
	<h2>Version 1</h2>
	<ul>
		<li><a href="/api">..</a></li>
		<li><a href="/api/v1/collections">collections</a></li>
		<li><a href="/api/v1/interfaces">interfaces</a></li>
	</ul>
</body>
</html>`,
	contentType: RESPONSE_TYPE_HTML
}));*/
router.all(`${ROUTER_PATH_COLLECTIONS_API}/v1`, (r :EnonicXpRequest) => listCollections(r));
router.all(`${ROUTER_PATH_COLLECTIONS_API}/v1/collection/{collection}`, (r :GetCollectionRequest) => getCollection(r));
router.all(`${ROUTER_PATH_COLLECTIONS_API}/v1/collection/{collection}/documents`, (r :AllDocumentRequest) => documentResponse(r));

router.all(`${ROUTER_PATH_INTERFACES_API}/v1`, (r :InterfaceRequest) => listInterfaces(r));
router.post(`${ROUTER_PATH_INTERFACES_API}/v1/interface/{interfaceName}`, (r :InterfaceRequest) => interfacePost(r));

export const all = (r :Request) => router.dispatch(r);
