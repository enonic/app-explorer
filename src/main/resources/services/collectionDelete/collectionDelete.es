import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';
//import {toStr} from '/lib/util';
import {send as sendEvent} from '/lib/xp/event';

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
	if (removeRes) {
		if (oldNode.doCollect && oldNode.cron) { // No need to reschedule if deleted node was unscheduled
			const event = {
				type: `${app.name}.reschedule`,
				distributed: true, // Change may happen on admin node, while crawl node needs the reschedule
				data: {
					oldNode
				}
			};
			//log.debug(`event:${toStr({event})}`);
			sendEvent(event);
		}
	} else {
		body = {
			error: `Failed to delete collection ${name}!`
		};
		status = 400;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
};
