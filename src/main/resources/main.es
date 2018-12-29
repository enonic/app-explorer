//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {addMembers, createRole, createUser} from '/lib/xp/auth';


//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	ROLE_YASE_ADMIN,
	ROLE_YASE_READ,
	ROLE_YASE_WRITE,
	USER_YASE_JOB_RUNNER_NAME,
	USER_YASE_JOB_RUNNER_USERSTORE,
	USER_YASE_JOB_RUNNER_KEY
} from '/lib/enonic/yase/admin/constants';
import {ignoreErrors} from '/lib/enonic/yase/admin/ignoreErrors';
import {initRepo} from '/lib/enonic/yase/admin/initRepo';
import {runAsSu} from '/lib/enonic/yase/admin/runAsSu';


//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────
runAsSu(() => {
	ignoreErrors(() => {
		createRole({
			name: ROLE_YASE_ADMIN,
			displayName: 'YASE Administrator',
			description: 'This role gives permissions to the YASE Admin application.'
		});
	});

	ignoreErrors(() => {
		createRole({
			name: ROLE_YASE_WRITE,
			displayName: 'YASE Repos Write Access',
			description: 'This role gives permissions to READ, CREATE, MODIFY and DELETE in repos created by the YASE Administrator app.'
		});
	});

	ignoreErrors(() => {
		createRole({
			name: ROLE_YASE_READ,
			displayName: 'YASE Repos Read Access',
			description: 'This role gives permissions to READ in repos created by the YASE Administrator app.'
		});
	});

	ignoreErrors(() => {
		createUser({
			displayName: 'YASE Job runner',
			//email: 'yase@example.com', // email is optional
			name: USER_YASE_JOB_RUNNER_NAME,
			userStore: USER_YASE_JOB_RUNNER_USERSTORE
		});
	});

	ignoreErrors(() => {
		addMembers(`role:${ROLE_YASE_WRITE}`, [USER_YASE_JOB_RUNNER_KEY]);
		addMembers(`role:${ROLE_YASE_READ}`, [USER_YASE_JOB_RUNNER_KEY]);
	});

	ignoreErrors(() => {
		initRepo();
	});
});
