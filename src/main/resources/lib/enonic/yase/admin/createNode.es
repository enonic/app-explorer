import {toStr} from '/lib/enonic/util';
import {getUser} from '/lib/xp/auth';
import {sanitize} from '/lib/xp/common';
//import {get as getContext} from '/lib/xp/context';


//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	BRANCH_ID,
	NT_FOLDER,
	REPO_ID
} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';


export function createNode({
	__repoId = REPO_ID,
	__branch = BRANCH_ID,
	__connection = connectRepo({
		repoId: __repoId,
		branch: __branch
	}),
	__user = getUser(),

	// It appears that properties that starts with an undescore are ignored, except the standard ones.
	// These doesn't work: _displayName _creator _createdTime _type

	// Mentioned in documentation:
	//_childOrder
	_indexConfig = {default: 'byType'},
	_inheritsPermissions = true,
	//_manualOrderValue
	_name,
	_parentPath = '/',
	_permissions = [],
	//_timestamp // Automatically added

	// Our own standard properties (cannot start with underscore)
	creator = __user.key,
	//createdTime,
	displayName = Array.isArray(_name)
		? _name.join(', ')
		: _name,
	//type,

	...rest
} = {}) {
	log.info(toStr({
		_parentPath, _name, displayName, rest
	}));
	//const context = getContext(); log.info(toStr({context}));
	const pathParts = _parentPath.split('/'); //log.info(toStr({pathParts}));
	for (let i = 1; i < pathParts.length; i += 1) {
		const path = pathParts.slice(0, i + 1).join('/'); //log.info(toStr({path}));
		const ancestor = __connection.get(path); //log.info(toStr({ancestor}));
		if (!ancestor) {
			const folderParams = {
				_indexConfig: {default: 'none'},
				_inheritsPermissions: true,
				_name: pathParts[i],
				_parentPath: pathParts.slice(0, i).join('/') || '/',
				creator,
				createdTime: new Date(),
				type: NT_FOLDER
			};
			//log.info(toStr({folderParams}));
			//const folder =
			__connection.create(folderParams);
			//log.info(toStr({folder}));
		}
	}

	const CREATE_PARAMS = {
		_indexConfig,
		_inheritsPermissions,
		_name: sanitize(_name),
		_parentPath,
		_permissions,
		creator,
		createdTime: new Date(),
		displayName,
		...rest
	};
	//log.info(toStr(CREATE_PARAMS));
	const createRes = __connection.create(CREATE_PARAMS);
	__connection.refresh(); // So the data becomes immidiately searchable
	return createRes;
}
