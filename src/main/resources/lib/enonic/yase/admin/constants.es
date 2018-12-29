//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {getToolUrl} from '/lib/xp/admin';
import {sanitize} from '/lib/xp/common';


//──────────────────────────────────────────────────────────────────────────────
// Admin tool
//──────────────────────────────────────────────────────────────────────────────
export const TOOL_PATH = getToolUrl(app.name, 'yase');


//──────────────────────────────────────────────────────────────────────────────
// Node types
//──────────────────────────────────────────────────────────────────────────────
export const NT_COLLECTION = `${app.name}:collection`;
export const NT_FIELD = `${app.name}:field`;
export const NT_FOLDER = `${app.name}:folder`;
export const NT_SYNONYM = `${app.name}:synonym`;
export const NT_TAG = `${app.name}:tag`;
export const NT_THESAURUS = `${app.name}:thesaurus`;


//──────────────────────────────────────────────────────────────────────────────
// Return types
//──────────────────────────────────────────────────────────────────────────────
export const RT_JSON = 'text/json;charset=utf-8';
export const RT_HTML = 'text/html;charset=utf-8';


//──────────────────────────────────────────────────────────────────────────────
// Repo
//──────────────────────────────────────────────────────────────────────────────
export const BRANCH_ID = 'master';
export const REPO_ID = sanitize(app.name);


//──────────────────────────────────────────────────────────────────────────────
// Roles
//──────────────────────────────────────────────────────────────────────────────
export const ROLE_YASE_ADMIN = sanitize(`${app.name}.admin`);
export const ROLE_YASE_READ = sanitize(`${app.name}.read`);
export const ROLE_YASE_WRITE = sanitize(`${app.name}.write`);


//──────────────────────────────────────────────────────────────────────────────
// User
//──────────────────────────────────────────────────────────────────────────────
export const USER_YASE_JOB_RUNNER_NAME = sanitize(`${app.name}.job.runner`);
export const USER_YASE_JOB_RUNNER_USERSTORE = 'system';
export const USER_YASE_JOB_RUNNER_KEY = `user:${USER_YASE_JOB_RUNNER_USERSTORE}:${USER_YASE_JOB_RUNNER_NAME}`;


//──────────────────────────────────────────────────────────────────────────────
// Root Permissions
//──────────────────────────────────────────────────────────────────────────────
export const ROOT_PERMISSION_SYSTEM_ADMIN = {
	principal: 'role:system.admin',
	allow: [
		'READ',
		'CREATE',
		'MODIFY',
		'DELETE',
		'PUBLISH',
		'READ_PERMISSIONS',
		'WRITE_PERMISSIONS'
	],
	deny: []
};

export const ROOT_PERMISSION_YASE_WRITE = {
	principal: `role:${ROLE_YASE_WRITE}`,
	allow: [
		'READ',
		'CREATE',
		'MODIFY',
		'DELETE'
	],
	deny: []
};

export const ROOT_PERMISSION_YASE_READ = {
	principal: `role:${ROLE_YASE_READ}`,
	allow: ['READ'],
	deny: []
};

export const ROOT_PERMISSIONS_YASE = [
	ROOT_PERMISSION_SYSTEM_ADMIN,
	ROOT_PERMISSION_YASE_WRITE,
	ROOT_PERMISSION_YASE_READ
];
