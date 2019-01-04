//import {toStr} from '/lib/enonic/util';
import {sanitize} from '/lib/xp/common';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (relative path with extension so it gets webpacked)
//──────────────────────────────────────────────────────────────────────────────
/*import {BRANCH_ID, REPO_ID} from './constants.es';
import connectRepo from './connectRepo.es';*/

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {BRANCH_ID, REPO_ID} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';


export function modifyNode({
	__repoId = REPO_ID,
	__branch = BRANCH_ID,
	__connection = connectRepo({
		repoId: __repoId,
		branch: __branch
	}),
	_id, // So it doesn't end up in rest.
	_parentPath = '/',
	_name,
	sanitizedName = sanitize(_name), // NOTE May already be sanitized
	key = `${_parentPath}/${sanitizedName}`, // TODO Use path join
	displayName = Array.isArray(_name)
		? _name.join(', ')
		: _name,
	...rest
} = {}) {
	//log.info(toStr({key, displayName, rest}));
	return __connection.modify({
		key,
		editor: (node) => {
			/* eslint-disable no-param-reassign */
			//node._timestamp = new Date(); // DOES NOT WORK?
			node.modifiedTime = new Date();
			node.displayName = displayName;
			//Object.entries(rest).forEach(([property, value]) => {
			Object.keys(rest).forEach((property) => {
				const value = rest[property];
				node[property] = value;
			});
			/* eslint-enable no-param-reassign */
			//log.info(toStr({node}));
			return node;
		}
	});
}
