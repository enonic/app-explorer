
import {toStr} from '/lib/enonic/util';
//import {getUser} from '/lib/xp/auth';
//import {get as getContext} from '/lib/xp/context';
import {create as createRepo, createBranch} from '/lib/xp/repo';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (relative path with extension so it gets webpacked)
//──────────────────────────────────────────────────────────────────────────────
//import {BRANCH_ID, REPO_ID} from './constants.es';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {
	BRANCH_ID,
	REPO_ID,
	ROOT_PERMISSIONS_YASE
} from '/lib/enonic/yase/admin/constants';


export function initRepo({
	repoId = REPO_ID,
	branchId = BRANCH_ID
} = {}) {
	//log.info(toStr({repoId, branchId}));
	const createRepoParams = {
		id: repoId,
		rootPermissions: ROOT_PERMISSIONS_YASE
	}; //log.info(toStr({createRepoParams}));
	//const context = getContext(); //log.info(toStr({context}));
	//const user = getUser(); //log.info(toStr({user}));
	/*const createRepoRes = */
	try {
		createRepo(createRepoParams); //log.info(toStr({createRepoRes}));
	} catch (e) {
		if (e.class.name !== 'com.enonic.xp.repo.impl.repository.RepositoryAlreadyExistException') {
			log.error(toStr({
				class: e.class,
				code: e.code,
				e
			}));
			throw e;
		}
	}
	let createBranchRes = {
		id: branchId
	};
	try {
		createBranchRes = createBranch({
			branchId,
			repoId
		});
	} catch (e) {
		if (e.code === 'branchAlreadyExists') {
			log.warning(`Branch ${branchId} already exist`);
		} else {
			throw e;
		}
	}
	//log.info(toStr({createBranchRes}));
	return createBranchRes;
}
