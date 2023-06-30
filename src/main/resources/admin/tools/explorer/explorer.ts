import type { InterfaceRequest } from '../../../webapp/interface/post';


import { Role } from '@enonic/explorer-utils';
// import {toStr} from '@enonic/js-utils';
//@ts-ignore
import newRouter from '/lib/router';
import {hasRole} from '/lib/xp/auth';
import {HTTP_HEADERS} from '@enonic/explorer-utils';
//import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {htmlResponse} from './htmlResponse';

import {overrideable as interfacePost} from '../../../webapp/interface/post';

const router = newRouter();


//──────────────────────────────────────────────────────────────────────────────
// Routes
//
// A link cannot specify method thus all links are GET
// A form with a submit button only supports GET and POST (not PUT DELETE PATCH)
// To make RESTful API you need GET, POST, PUT, PATCH and DELETE
// You could potentially use js onClick, but that's a lot for code :(
// So I will try to make routes using as much GET as possible
// And possibly a few instances of POST.
//──────────────────────────────────────────────────────────────────────────────
router.filter((
	req,
	next
) => {
	// log.info('filter request:%s', toStr(req));
	if (!(hasRole(Role.EXPLORER_ADMIN) || hasRole(Role.SYSTEM_ADMIN))) { return { status: 401 }; }
	// log.info('filter method:%s', req.method); // form method only supports get and post

	//return htmlResponse(req);
	return next(req);
});

router.all('', (r) => { // Without ending slash is actually the default link.
	// log.info('missing slash request:%s', toStr(r));
	return htmlResponse(r);
});

router.all('/', (r) => {
	// log.info('/ request:%s', toStr(r));
	return htmlResponse(r);
});


router.post('/api/v1/interface', (r: InterfaceRequest) => {
	// log.info('/api/v1/interface request:%s', toStr(r));
	return interfacePost(
		r,
		() => ({
			body: JSON.stringify({
				allowedInterfaces: [r.headers[HTTP_HEADERS.EXPLORER_INTERFACE_NAME]]
			}),
			contentType: 'text/json;charset=utf-8',
			status: 200,
		})
	);
});

router.all('{path:.+}', (r) => { // Doens't cover '/' ?
	// log.info('path request:%s', toStr(r));
	return htmlResponse(r);
});

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	// log.info('all request:%s', toStr(req));
	return router.dispatch(req);
}
