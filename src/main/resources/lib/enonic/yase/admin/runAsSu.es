import {run} from '/lib/xp/context';


export function runAsSu(fn, {
	branch = 'master',
	repository = 'system-repo'
} = {}) {
	return run({
		branch,
		repository,
		user: {
			login: 'su',
			userStore: 'system'
		},
		principals: ['role:system.admin']
	}, () => fn());
}
