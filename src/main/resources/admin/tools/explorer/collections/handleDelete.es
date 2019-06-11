import {send} from '/lib/xp/event';

import {
	BRANCH_ID_EXPLORER,
	REPO_ID_EXPLORER,
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getCollectors} from '/lib/explorer/collection/reschedule';


export const handleDelete = ({
	path,
	params: {
		typedCollectionName
	}
}) => {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const collectionName = pathParts[2];

	const messages = [];
	let status = 200;
	if (!typedCollectionName) {
		messages.push('Missing required parameter "typedCollectionName"!');
		status = 400;
	} else if (typedCollectionName !== collectionName) {
		messages.push(`Typed collection name: "${typedCollectionName}" doesn't match actual collection name: "${collectionName}"!`);
		status = 400;
	} else {
		const connection = connect({
			repoId: REPO_ID_EXPLORER,
			branch: BRANCH_ID_EXPLORER,
			principals: [PRINCIPAL_EXPLORER_WRITE]
		});
		const nodePath = `/collections/${collectionName}`;

		const oldNode = connection.get(nodePath);
		const collectors = getCollectors({connection});

		const deleteRes = connection.delete(nodePath);
		if(deleteRes) {
			messages.push(`Collection with path:${nodePath} deleted.`)
			send({
				type: `${app.name}.reschedule`,
				distributed: true,
				data: {
					collectors,
					node: {
						_id: oldNode._id,
						//cron: [],
						doCollect: false
					},
					oldNode
				}
			});
		} else {
			messages.push(`Something went wrong when trying to delete collection with path:${nodePath}.`)
			status = 500;
		}
	}
	return {
		redirect: `${TOOL_PATH}/collections/list?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
} // handleDelete
