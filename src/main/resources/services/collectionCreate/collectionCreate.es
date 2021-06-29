//import {toStr} from '/lib/util';
//import {forceArray} from '/lib/util/data';
import {getUser} from '/lib/xp/auth';
import {sanitize} from '/lib/xp/common';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';


export function post({
	body: json
}) {
	//log.debug(`json:${json}`);

	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);

	const body = {};
	let status = 200;

	obj._name = sanitize(obj._name);

	if (!obj._name) {
		body.error = 'Name cannot be empty!';
		status = 400;
	} else {
		try {
			obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
			//log.debug(`obj:${toStr({obj})}`);

			const params = collection(obj);
			//log.debug(`params:${toStr({params})}`);
			params._inheritsPermissions = true;
			params._permissions = [];
			params.creator = getUser().key;
			params.createdTime = new Date();
			//log.info(`params:${toStr(params)}`);

			const cron = JSON.parse(JSON.stringify(params.cron));
			delete params.cron;
			const doCollect = JSON.parse(JSON.stringify(params.doCollect));
			delete params.doCollect;

			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});
			const collectionNode = writeConnection.create(params);
			//log.info(`node:${toStr(node)}`);

			if (collectionNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				body.name = collectionNode._name;
				collectionNode.cron = cron;
				collectionNode.doCollect = doCollect;
				createOrModifyJobsFromCollectionNode({
					connection: writeConnection,
					collectionNode,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				});
			} else {
				throw new Error(`Something went wrong when trying to create collection ${obj._name}`);
			}
		} catch (e) {
			log.error('e', e);
			body.error = `Something went wrong when trying to create collection ${obj._name}`;
			status = 500;
		}
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
