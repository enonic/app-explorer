/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

export {all} from '/lib/explorer/api';

/*
import Router from '/lib/router';
import {toStr} from '/lib/util';

const router = Router();

router.all('/api/1/documents', (request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {
			path: 'documents'
		},
		contentType: 'text/json;charset=utf-8'
	};
});

router.all('', (request) => {
	log.info(`request:${toStr(request)}`);
	return {
		body: {
			uke: 'bla'
		},
		contentType: 'text/json;charset=utf-8'
	};
});

export const all = (r) => router.dispatch(r);
*/
