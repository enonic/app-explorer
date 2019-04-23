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
	ROLE_SYSTEM_ADMIN,
	ROLE_YASE_ADMIN,
	TOOL_PATH
} from '/lib/enonic/yase/constants';
import {toolPage} from '/lib/enonic/yase/admin/toolPage';

import {list as listCollections} from '/lib/enonic/yase/admin/collections/list';
import {newOrEdit as newOrEditCollection} from '/lib/enonic/yase/admin/collections/newOrEdit';
import {confirmDelete as confirmDeleteCollection} from '/lib/enonic/yase/admin/collections/confirmDelete';
import {collect} from '/lib/enonic/yase/admin/collections/collect';
import {stop} from '/lib/enonic/yase/admin/collections/stop';
import {handleDelete as deleteCollection} from '/lib/enonic/yase/admin/collections/handleDelete';
import {createOrUpdate as createOrUpdateCollection} from '/lib/enonic/yase/admin/collections/createOrUpdate';
import {status as collectorStatus} from '/lib/enonic/yase/admin/collections/status';
import {journal} from '/lib/enonic/yase/admin/collections/journal';

import {newOrEdit as newOrEditField} from '/lib/enonic/yase/admin/fields/newOrEdit';
import {newOrEdit as newOrEditValue} from '/lib/enonic/yase/admin/fields/values/newOrEdit';
import {handleFieldsPost} from '/lib/enonic/yase/admin/fields/handleFieldsPost';
import {list as listFields} from '/lib/enonic/yase/admin/fields/list';

import {list as listThesauri} from '/lib/enonic/yase/admin/thesauri/list';
import {newOrEdit as newOrEditThesaurus} from '/lib/enonic/yase/admin/thesauri/newOrEdit';
import {confirmDelete as confirmDeleteThesaurus} from '/lib/enonic/yase/admin/thesauri/confirmDelete';
import {importPage} from '/lib/enonic/yase/admin/thesauri/importPage';
import {exportThesaurus} from '/lib/enonic/yase/admin/thesauri/exportThesaurus';
import {handleThesauriPost} from '/lib/enonic/yase/admin/thesauri/handleThesauriPost';

import {newOrEdit as newOrEditSynonym} from '/lib/enonic/yase/admin/thesauri/synonyms/newOrEdit';
import {handlePost as handleSynonymsPost} from '/lib/enonic/yase/admin/thesauri/synonyms/handlePost';

import {list as listInterfaces} from '/lib/enonic/yase/admin/interfaces/list';
import {newOrEdit as newOrEditInterface} from '/lib/enonic/yase/admin/interfaces/newOrEdit';
import {confirmDelete as confirmDeleteInterface} from '/lib/enonic/yase/admin/interfaces/confirmDelete';
import {handlePost as handleInterfacesPost} from '/lib/enonic/yase/admin/interfaces/handlePost';


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
router.filter((req/*, next*/) => {
	if (!(hasRole(ROLE_YASE_ADMIN) || hasRole(ROLE_SYSTEM_ADMIN))) { return { status: 401 }; }
	//log.info(toStr({method: req.method})); // form method only supports get and post

	const {method, path} = req;
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	if (!relPath) { return toolPage(req); }

	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const tab = pathParts[0];
	const action = pathParts[1];
	const secondaryAction = pathParts[3];

	/*──────────────────────────────────────────────────────────────────────────
	GET  /collections      -> LIST collections
	GET  /collections/list -> LIST collections

	GET  /collections/new    -> EDIT new collection
	POST /collections/create -> CREATE new collection

	GET  /collections/edit/name   -> EDIT collection
	POST /collections/update/name -> UPDATE collection

	GET  /collections/delete/name -> CONFIRM DELETE collection
	POST /collections/delete/name -> DELETE collection

	GET  /collections/collect/name?params -> COLLECT collection
	GET  /collections/stop/name           -> STOP collector

	GET  /collections/status
	GET  /collections/journal
	──────────────────────────────────────────────────────────────────────────*/

	if (tab === 'collections') {
		switch (action) {
		case 'new': // fallthrough to edit
		case 'edit': return newOrEditCollection(req);

		case 'create': // fallthrough to update
		case 'update': return createOrUpdateCollection(req);

		case 'collect': return collect(req);
		case 'stop': return stop(req);
		case 'delete': return method === 'POST' ? deleteCollection(req) : confirmDeleteCollection(req);
		case 'journal': return journal(req);
		case 'status': return collectorStatus(req);

		case 'list': // fallthrough to default
		default: return listCollections(req);
		}
	} // collections


	/*──────────────────────────────────────────────────────────────────────────
	 GET  /fields      -> LIST fields
	 GET  /fields/list -> LIST fields

	 GET  /fields/new    -> EDIT new field
	 POST /fields/create -> CREATE new field

	 GET  /fields/edit/fieldName   -> EDIT field (lists values)
	 POST /fields/update/fieldName -> UPDATE field
	 POST /fields/delete/fieldName -> DELETE field

	 GET  /fields/values/fieldName -> LIST field values

	 GET  /fields/values/fieldName/new    -> EDIT new field value
	 POST /fields/values/fieldName/create -> CREATE new field value

	 GET  /fields/values/fieldName/edit/valueName   -> EDIT field value
	 POST /fields/values/fieldName/update/valueName -> UPDATE new field value
	 POST /fields/values/fieldName/delete/valueName -> DELETE new field value
	──────────────────────────────────────────────────────────────────────────*/
	if (tab === 'fields') {
		switch (action) {
		case 'new': // fallthrough to edit
		case 'edit': return newOrEditField(req);
		case 'create': // fallthrough to update
		case 'delete': // fallthrough to update
		case 'update': return handleFieldsPost(req);
		case 'values':
			switch (secondaryAction) {
			case 'new': // fallthrough to edit
			case 'edit': return newOrEditValue(req);
			case 'create': // fallthrough to update
			case 'delete': // fallthrough to update
			case 'update': return handleFieldsPost(req);
			default: return newOrEditField(req);
			} // values
		default: return listFields(req);
		} // action
	} // fields

	/*──────────────────────────────────────────────────────────────────────────
	GET  /thesauri      -> LIST thesauri
	GET  /thesauri/list -> LIST thesauri

	GET  /thesauri/new    -> EDIT new thesaurus
	POST /thesauri/create -> CREATE new thesaurus

	GET  /thesauri/import/thesaurusName -> IMPORT FORM
	POST /thesauri/import/thesaurusName -> IMPORT synonyms
	GET  /thesauri/export/thesaurusName -> EXPORT thesaurus

	GET  /thesauri/edit/thesaurusName   -> EDIT thesaurus (lists values)
	GET  /thesauri/delete/thesaurusName -> CONFIRM DELETE thesaurus
	POST /thesauri/delete/thesaurusName -> DELETE thesaurus
	POST /thesauri/update/thesaurusName -> UPDATE thesaurus

	GET  /thesauri/synonyms/thesaurusName/new -> EDIT new synonym
	POST  /thesauri/synonyms/thesaurusName/create/synonymName -> Create new synonym

	GET  /thesauri/synonyms/thesaurusName/edit/synonymName -> EDIT synonym
	GET  /thesauri/synonyms/thesaurusName/delete/synonymName -> DELETE synonym
	GET  /thesauri/synonyms/thesaurusName/update/synonymName -> UPDATE synonym
	──────────────────────────────────────────────────────────────────────────*/
	if (tab === 'thesauri') {
		switch (action) {
		case 'new': // fallthrough to edit
		case 'edit': return newOrEditThesaurus(req);
		case 'import': return method === 'POST' ? handleThesauriPost(req) : importPage(req);
		case 'export': return exportThesaurus(req);
		case 'create': // fallthrough to update
		case 'update': return handleThesauriPost(req);
		case 'delete': return method === 'POST' ? handleThesauriPost(req) : confirmDeleteThesaurus(req);
		case 'synonyms':
			switch (secondaryAction) {
			case 'new': // fallthrough to edit
			case 'edit': return newOrEditSynonym(req);
			case 'create': // fallthrough to update
			case 'delete': // fallthrough to update
			case 'update': return handleSynonymsPost(req);
			default: return newOrEditThesaurus(req);
			} // synonyms
		default: return listThesauri(req);
		}
	} // thesauri

	/*──────────────────────────────────────────────────────────────────────────
	GET  /interfaces      -> LIST interfaces
	GET  /interfaces/list -> LIST interfaces
	──────────────────────────────────────────────────────────────────────────*/
	if (tab === 'interfaces') {
		switch (action) {
		case 'new': // fallthrough to edit
		case 'edit': return newOrEditInterface(req);
		case 'create': // fallthrough to update
		case 'update': return handleInterfacesPost(req);
		case 'delete': return method === 'POST' ? handleInterfacesPost(req) : confirmDeleteInterface(req);
		default: return listInterfaces(req);
		}
	}

	return toolPage(req);
});

// NOTE https://github.com/enonic/xp/issues/6793

export function all(req) {
	return router.dispatch(req);
}
