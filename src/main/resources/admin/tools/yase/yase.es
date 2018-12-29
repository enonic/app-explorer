//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import newRouter from '/lib/router';
import {hasRole} from '/lib/xp/auth';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	ROLE_YASE_ADMIN,
	TOOL_PATH
} from '/lib/enonic/yase/admin/constants';
import {toolPage} from '/lib/enonic/yase/admin/routes/toolPage';
import {handleFieldsPost} from '/lib/enonic/yase/admin/routes/fields/handleFieldsPost';
import {fieldsPage} from '/lib/enonic/yase/admin/routes/fields/fieldsPage';


const router = newRouter();


//──────────────────────────────────────────────────────────────────────────────
// Routes
//──────────────────────────────────────────────────────────────────────────────
router.filter((req/*, next*/) => {
	if (!hasRole(ROLE_YASE_ADMIN)) { return { status: 401 }; }
	const relPath = req.path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	if (!relPath) { return toolPage(req); }

	if (relPath.startsWith('/fields')) {
		if (req.method === 'POST') { return handleFieldsPost(req); }
		return fieldsPage(req);
	}

	return toolPage(req);
});

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
