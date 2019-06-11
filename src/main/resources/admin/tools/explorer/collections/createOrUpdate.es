//import {toStr} from '/lib/util';
import {send} from '/lib/xp/event';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {getCollectors, reschedule} from '/lib/explorer/collection/reschedule';


export const createOrUpdate = ({
	params//,
	//path
}) => {
	/*log.info(toStr({
		params,
		path
	}));*/

	const {json} = params;
	//log.info(toStr({json}));

	const obj = JSON.parse(json);
	//log.info(toStr({obj}));

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const parentPath = '/collections';

	//const cron = app.config.cron === 'true';
	//const oldNode = cron ? connection.get(`${parentPath}/${obj.name}`) : null;
	const oldNode = connection.get(`${parentPath}/${obj.name}`);

	obj.__connection = connection; // eslint-disable-line no-underscore-dangle
	obj._indexConfig = {default: 'byType'};
	obj._name = obj.name;
	obj._parentPath = parentPath;
	obj.displayName = obj.name;
	obj.type = NT_COLLECTION;

	// ForceArray workaround:
	//obj.json = json;
	obj.collector.configJson = JSON.stringify(obj.collector.config);

	//log.info(toStr({obj}));

	let status = 200;
	const messages = [];
	const node = createOrModify(obj);
	if(node) {
		messages.push(`Collection ${obj.name} saved.`);
		//if (cron) {
		const collectors = getCollectors({connection});
		//log.info(toStr({collectors}));
		/*reschedule({
			collectors,
			node,
			oldNode
		});*/
		send({
			type: `${app.name}.reschedule`,
			distributed: true,
			data: {
				collectors,
				node,
				oldNode
			}
		});
		//}
	} else {
		messages.push(`Something went wrong when saving collection ${obj.name}!`);
		status = 500;
	}
	return {
		redirect: `${TOOL_PATH}/collections/list?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
};
