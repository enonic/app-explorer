/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import '@enonic/nashorn-polyfills';

import {
	RESPONSE_TYPE_HTML/*,
	toStr*/
} from '@enonic/js-utils';

import Router from '/lib/router';
import {
	collectionResponse,
	listCollections
} from './collection';
import {all as documentResponse} from './collection/document';
import {post as interfacePost} from './interface';


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
	</ul>
</body>
</html>`,
	contentType: RESPONSE_TYPE_HTML
}));
router.all('/api/v1/collections', (r) => listCollections(r));
router.all('/api/v1/collections/{collection}', (r) => collectionResponse(r));
router.all('/api/v1/collections/{collection}/documents', (r) => documentResponse(r));
router.post('/api/v1/interface/{interfaceName}', (r) => interfacePost(r));


export const all = (r) => router.dispatch(r);
