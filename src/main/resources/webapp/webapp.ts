/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import type {EnonicXpRequest} from '@enonic-types/lib-explorer';
import type {AllDocumentRequest} from './collection/document';
import type {InterfaceRequest} from './interface/post';


import '@enonic/nashorn-polyfills';

/*import {
	RESPONSE_TYPE_HTML,
	toStr
} from '@enonic/js-utils';*/

//@ts-ignore
import Router from '/lib/router';
import {all as documentResponse} from './collection/document';
import {
	post as interfacePost
} from './interface';


const router = Router();

router.all('/documents/api/v1', (r: AllDocumentRequest) => documentResponse(r));
router.all('/documents/api/v1/', (r: AllDocumentRequest) => documentResponse(r));

router.post('/api/graphql', (r: InterfaceRequest) => interfacePost(r));
router.post('/api/graphql/', (r: InterfaceRequest) => interfacePost(r));
//router.all('/api/graphql', (r :InterfaceRequest) => listInterfaces(r)); // TODO GraphiQL instead

export const all = (r: EnonicXpRequest) => router.dispatch(r);
