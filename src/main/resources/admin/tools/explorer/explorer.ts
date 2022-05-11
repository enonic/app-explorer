//import {toStr} from '@enonic/js-utils';

//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
//@ts-ignore
import newRouter from '/lib/router';
//@ts-ignore
import {hasRole} from '/lib/xp/auth';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	ROLE_SYSTEM_ADMIN,
	ROLE_EXPLORER_ADMIN
} from '/lib/explorer/model/2/constants';
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
	if (!(hasRole(ROLE_EXPLORER_ADMIN) || hasRole(ROLE_SYSTEM_ADMIN))) { return { status: 401 }; }
	//log.info(toStr({method: req.method})); // form method only supports get and post

	//return htmlResponse(req);
	return next(req);
});

router.all('/', (r) => htmlResponse(r));

router.post('/api/v1/interface/{interfaceName}', (r) => interfacePost(
	r,
	() => false // false means always authorized
));

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
