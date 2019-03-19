//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {toStr} from '/lib/enonic/util';
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

import {collectionsPage} from '/lib/enonic/yase/admin/collections/collectionsPage';
import {createOrEditCollectionPage} from '/lib/enonic/yase/admin/collections/createOrEditCollectionPage';
import {deleteCollectionPage} from '/lib/enonic/yase/admin/collections/deleteCollectionPage';
import {handleCollectionAction} from '/lib/enonic/yase/admin/collections/handleCollectionAction';
import {handleCollectionsPost} from '/lib/enonic/yase/admin/collections/handleCollectionsPost';

import {createOrEditFieldPage} from '/lib/enonic/yase/admin/fields/createOrEditFieldPage';
import {createOrEditValuePage} from '/lib/enonic/yase/admin/fields/createOrEditValuePage';
import {handleFieldsPost} from '/lib/enonic/yase/admin/fields/handleFieldsPost';
import {fieldsPage} from '/lib/enonic/yase/admin/fields/fieldsPage';

import {createOrEditTagPage} from '/lib/enonic/yase/admin/tags/createOrEditTagPage';
import {handleTagDelete} from '/lib/enonic/yase/admin/tags/handleTagDelete';
import {handleTagsPost} from '/lib/enonic/yase/admin/tags/handleTagsPost';
import {tagsPage} from '/lib/enonic/yase/admin/tags/tagsPage';

import {handleThesauriPost} from '/lib/enonic/yase/admin/thesauri/handleThesauriPost';
import {handleThesaurusPost} from '/lib/enonic/yase/admin/thesauri/handleThesaurusPost';
import {listThesauriPage} from '/lib/enonic/yase/admin/thesauri/listThesauriPage';
import {thesaurusPage} from '/lib/enonic/yase/admin/thesauri/thesaurusPage';
import {editSynonymPage} from '/lib/enonic/yase/admin/thesauri/editSynonymPage';

import {interfacesPage} from '/lib/enonic/yase/admin/interfaces/interfacesPage';
import {createOrEditInterfacePage} from '/lib/enonic/yase/admin/interfaces/createOrEditInterfacePage';
import {deleteInterfacePage} from '/lib/enonic/yase/admin/interfaces/deleteInterfacePage';
import {handleInterfacesPost} from '/lib/enonic/yase/admin/interfaces/handleInterfacesPost';


const router = newRouter();


//──────────────────────────────────────────────────────────────────────────────
// Routes
//──────────────────────────────────────────────────────────────────────────────
router.filter((req/*, next*/) => {
	if (!hasRole(ROLE_YASE_ADMIN)) { return { status: 401 }; }
	//log.info(toStr({method: req.method})); // form method only supports get and post

	const relPath = req.path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	if (!relPath) { return toolPage(req); }

	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));


	if (pathParts[0] === 'collections') {
		if (pathParts.length === 3) {
			if (req.method === 'POST') {
				return handleCollectionAction(req);
			}
			return deleteCollectionPage(req);
		}
		if (pathParts.length === 2) {
			return createOrEditCollectionPage(req);
		}
		if (req.method === 'POST') { return handleCollectionsPost(req); }
		return collectionsPage(req);
	}

	/*──────────────────────────────────────────────────────────────────────────
	 GET  /fields -> LIST fields

	 POST /fields -> CREATE field (and show list fiels page)
	 GET  /fields/fieldName -> EDIT field
	 POST /fields/fieldName/update -> UPDATE field (and show list fiels page)
	 POST /fields/fieldName/delete -> DELETE field (and show list fiels page)

	 POST /fields/fieldName/values -> CREATE value (and show edit field page)
	 GET  /fields/fieldName/values/valueName -> EDIT value
	 POST /fields/fieldName/values/valueName/update -> UPDATE value (and show edit field page)
	 POST /fields/fieldName/values/valueName/delete -> DELETE value (and show edit field page)
	──────────────────────────────────────────────────────────────────────────*/
	if (pathParts[0] === 'fields') {
		if (req.method === 'POST') { return handleFieldsPost(req); }
		if (pathParts[3]) { // valueName is defined
			return createOrEditValuePage(req);
		}
		if (pathParts[1]) { // fieldName is defined
			return createOrEditFieldPage(req);
		}
		return fieldsPage(req);
	}


	if (pathParts[0] === 'tags') {
		if (pathParts.length === 3 && pathParts[2] === 'delete') {
			return handleTagDelete(req);
		}
		if (pathParts.length === 2) {
			return createOrEditTagPage(req);
		}
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

	if (pathParts[0] === 'interfaces') {
		if (req.method === 'POST') { return handleInterfacesPost(req); }
		if (pathParts.length === 3) {
			return deleteInterfacePage(req);
		}
		if (pathParts.length === 2) {
			return createOrEditInterfacePage(req);
		}
		return interfacesPage(req);
	}

	return toolPage(req);
});

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
