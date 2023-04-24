import { Role } from '@enonic/explorer-utils';
//import {toStr} from '@enonic/js-utils';
//@ts-ignore
import newRouter from '/lib/router';
import {hasRole} from '/lib/xp/auth';
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
	if (!(hasRole(Role.EXPLORER_ADMIN) || hasRole(Role.SYSTEM_ADMIN))) { return { status: 401 }; }
	//log.info(toStr({method: req.method})); // form method only supports get and post

	//return htmlResponse(req);
	return next(req);
});

router.all('/', (r) => htmlResponse(r));

router.post('/api/v1/interface', (r) => interfacePost(
	r,
	() => false // false means always authorized
));

router.all('{path:.+}', (r) => htmlResponse(r)); // Doens't cover '/' ?

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
