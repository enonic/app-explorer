/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import type {Request} from '../types/Request';
import type {GetCollectionRequest} from './collection/get';
import type {AllDocumentRequest} from './collection/document';
import type {InterfaceRequest} from './interface/post';


import '@enonic/nashorn-polyfills';

import {
	RESPONSE_TYPE_HTML/*,
	toStr*/
} from '@enonic/js-utils';

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


const router = Router();

router.all('/api', () => ({
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
}));
router.all('/api/v1/collections', (r :Request) => listCollections(r));
router.all('/api/v1/collections/{collection}', (r :GetCollectionRequest) => getCollection(r));
router.all('/api/v1/collections/{collection}/documents', (r :AllDocumentRequest) => documentResponse(r));
router.all('/api/v1/interfaces', (r :InterfaceRequest) => listInterfaces(r));
router.post('/api/v1/interface/{interfaceName}', (r :InterfaceRequest) => interfacePost(r));


export const all = (r :Request) => router.dispatch(r);