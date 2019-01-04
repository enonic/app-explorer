import {toStr} from '/lib/enonic/util';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (relative path with extension so it gets webpacked)
//──────────────────────────────────────────────────────────────────────────────
/*import {BRANCH_ID, REPO_ID} from './constants.es';
import connectRepo from './connectRepo.es';
import createNode from './createNode.es';
import modifyNode from './modifyNode.es';*/

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {BRANCH_ID, REPO_ID} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';
import {createNode} from '/lib/enonic/yase/admin/createNode';
import {modifyNode} from '/lib/enonic/yase/admin/modifyNode';


const CATCH_CLASS_NAMES = [
	'com.enonic.xp.node.NodeIdExistsException',
	'com.enonic.xp.node.NodeAlreadyExistAtPathException'
];


export function createOrModifyNode({
	__repoId = REPO_ID,
	__branch = BRANCH_ID,
	__connection = connectRepo({
		repoId: __repoId,
		branch: __branch
	}),
	_parentPath = '/',
	//_path = '/',
	_name,
	displayName = Array.isArray(_name)
		? _name.join(', ')
		: _name,
	...rest
} = {}) {
	/*log.info(toStr({
		_parentPath, _name, displayName, rest
	}));*/
	let rv;
	try {
		rv = createNode({
			__connection, _parentPath, _name, displayName, ...rest
		});
	} catch (catchedError) {
		if (CATCH_CLASS_NAMES.includes(catchedError.class.name)) {
			rv = modifyNode({
				__connection, _parentPath, _name, displayName, ...rest
			});
		} else {
			log.error(toStr({catchedErrorClassName: catchedError.class.name}));
			throw catchedError;
		}
	}
	//log.info(toStr({createOrModifyNodeRv: rv}));
	return rv;
}
