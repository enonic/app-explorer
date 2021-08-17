/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import '@enonic/nashorn-polyfills';

//export {all} from '/lib/explorer/api'; // TODO Make this available again!!!

import Router from '/lib/router';
import {collectionResponse} from './collection';
import {all as documentResponse} from './collection/document';
import {post as interfacePost} from './interface';

const router = Router();

router.all('/api/v1/collections/{collection}', (r) =>collectionResponse(r));
router.all('/api/v1/collections/{collection}/documents', (r) => documentResponse(r));
router.post('/api/v1/interface/{interfaceName}', (r) => interfacePost(r));

export const all = (r) => router.dispatch(r);
