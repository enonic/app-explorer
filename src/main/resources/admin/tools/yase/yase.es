//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
//import {toStr} from '/lib/enonic/util';
import newRouter from '/lib/router';
import {hasRole} from '/lib/xp/auth';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	ROLE_YASE_ADMIN,
	TOOL_PATH
} from '/lib/enonic/yase/constants';
import {toolPage} from '/lib/enonic/yase/admin/toolPage';

import {createOrEditCollectionPage} from '/lib/enonic/yase/admin/collections/createOrEditCollectionPage';

import {handleFieldsPost} from '/lib/enonic/yase/admin/fields/handleFieldsPost';
import {fieldsPage} from '/lib/enonic/yase/admin/fields/fieldsPage';

import {handleTagsPost} from '/lib/enonic/yase/admin/tags/handleTagsPost';
import {tagsPage} from '/lib/enonic/yase/admin/tags/tagsPage';

import {handleThesauriPost} from '/lib/enonic/yase/admin/thesauri/handleThesauriPost';
import {handleThesaurusPost} from '/lib/enonic/yase/admin/thesauri/handleThesaurusPost';
import {listThesauriPage} from '/lib/enonic/yase/admin/thesauri/listThesauriPage';
import {thesaurusPage} from '/lib/enonic/yase/admin/thesauri/thesaurusPage';
import {editSynonymPage} from '/lib/enonic/yase/admin/thesauri/editSynonymPage';


const router = newRouter();


//──────────────────────────────────────────────────────────────────────────────
// Routes
//──────────────────────────────────────────────────────────────────────────────
router.filter((req/*, next*/) => {
	if (!hasRole(ROLE_YASE_ADMIN)) { return { status: 401 }; }
	const relPath = req.path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	if (!relPath) { return toolPage(req); }

	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));

	if (pathParts[0] === 'collections') {
		return createOrEditCollectionPage(req);
	}

	if (pathParts[0] === 'fields') {
		if (req.method === 'POST') { return handleFieldsPost(req); }
		return fieldsPage(req);
	}

	if (pathParts[0] === 'tags') {
		if (req.method === 'POST') { return handleTagsPost(req); }
		return tagsPage(req);
	}

	if (pathParts[0] === 'thesauri') {
		if (pathParts.length === 1) {
			if (req.method === 'POST') { return handleThesauriPost(req); }
			return listThesauriPage(req);
		}
		//const thesaurusName = pathParts[1]; log.info(toStr({thesaurusName}));
		if (pathParts.length === 2) {
			if (req.method === 'POST') { return handleThesaurusPost(req); }
			return thesaurusPage(req);
		}
		//pathParts.length === 3
		//const synonymId = pathParts[2]; log.info(toStr({synonymId}));
		return editSynonymPage(req);
	}

	return toolPage(req);
});

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
