import {
	RESPONSE_TYPE_JSON//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {get as getTask} from '/lib/explorer/task/get';
import {modify as modifyTask} from '/lib/explorer/task/modify';


export function post({
	params: {
		collectionName
	}
}) {
	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`; //log.info(toStr({repoId}));
	const connection = connect({
		repoId,
		branch: 'master',
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const task = getTask({connection});	//log.info(toStr({task}));
	const {state} = task;

	log.info(`Stopping task with state: ${state} from collecting to ${repoId}`);

	modifyTask({
		connection,
		should: 'STOP',
		state
	});

	return {
		body: {
			message: `Stopping task with state: ${state} from collecting to ${repoId}`
		},
		contentType: RESPONSE_TYPE_JSON
	};
} // post
