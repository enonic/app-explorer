import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';
import {listExplorerJobsThatStartWithName} from '/lib/explorer/scheduler/listExplorerJobsThatStartWithName';

import {toStr} from '/lib/util';
import {delete as deleteJob} from '/lib/xp/scheduler';
import {executeFunction} from '/lib/xp/task';

const PATH_COLLECTIONS = '/collections';

exports.delete = ({
	params: {
		name
	}
}) => {
	//log.debug(`name:${toStr({name})}`);
	const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});

	const nodePath = `${PATH_COLLECTIONS}/${name}`;
	//log.debug(`nodePath:${toStr({nodePath})}`);

	const oldNode = writeConnection.get(nodePath);
	//log.debug(`oldNode:${toStr({oldNode})}`);

	if (!oldNode) {
		const message = `Can't delete collection node with path:${nodePath}, unable to find it!`;
		log.error(message);
		return {
			body: {
				message
			},
			contentType: RT_JSON,
			status: 404
		};
	}

	executeFunction({
		description: `Delete any scheduled job relating to collection with path:${oldNode._path}`,
		func: () => {
			const explorerJobsThatStartWithName = listExplorerJobsThatStartWithName({name: oldNode._id});
			log.info(`collection path:${oldNode._path} explorerJobsThatStartWithName:${toStr(explorerJobsThatStartWithName)}`);
			explorerJobsThatStartWithName.forEach(({name}) => {
				log.info(`Deleting job name:${name}, while deleting collection with path:${oldNode._path}`);
				deleteJob({name});
			});
		}
	});

	const removeRes = remove({
		connection: writeConnection,
		_parentPath: PATH_COLLECTIONS,
		_name: name
	});
	//log.debug(`removeRes:${toStr({removeRes})}`);
	let body = {
		message: `Deleted collection ${name}`
	};
	let status = 200;
	if (!removeRes) {
		body = {
			error: `Failed to delete collection ${name}!`
		};
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
};
