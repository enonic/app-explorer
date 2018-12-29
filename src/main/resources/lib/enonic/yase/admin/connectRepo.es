//import {toStr} from '/lib/enonic/util';
import {get as getContext} from '/lib/xp/context';
import {connect} from '/lib/xp/node';


//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {BRANCH_ID, REPO_ID} from '/lib/enonic/yase/admin/constants';


export function connectRepo({
	context = getContext(),
	repoId = REPO_ID,
	branch = BRANCH_ID,
	principals,
	login = context.authInfo.user.login,
	userStore = context.authInfo.user.userStore,
	user = {
		login,
		userStore
	}
} = {}) {
	//log.info(toStr({context}));
	const connectParams = {
		repoId,
		branch,
		principals: principals ? context.authInfo.principals.concat(principals.split(',')) : context.authInfo.principals,
		user
	};
	//log.info(toStr({connectParams}));
	return connect(connectParams);
}
