/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import '@enonic/nashorn-polyfills';

//export {all} from '/lib/explorer/api'; // TODO Make this available again!!!

import Router from '/lib/router';
import {post as interfacePost} from './interface';

const router = Router();

router.post('/api/v1/interface/{interfaceName}', (request) => interfacePost(request));

export const all = (r) => router.dispatch(r);
