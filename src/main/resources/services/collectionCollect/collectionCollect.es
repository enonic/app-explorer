import {toStr} from '/lib/util';
import {assetUrl} from '/lib/xp/portal';
import {submitTask} from '/lib/xp/task';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {get as getCollection} from '/lib/explorer/collection/get';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {getTasksWithPropertyValue} from '/lib/explorer/task/getTasksWithPropertyValue';


const DEBUG = false;


export function post({
	params: {
		name,
		resume = false
	}
}) {
	DEBUG && log.info(`name:${name} resume:${resume}`);
	const body = {};
	let status = 200;

	const runningTasksWithName = getTasksWithPropertyValue({
		value: name,
		state: 'RUNNING'
	});
	DEBUG && log.info(`runningTasksWithName:${runningTasksWithName}`);

	if (runningTasksWithName.length) {
		const alreadyRunningtaskId = runningTasksWithName[0].id;
		status = 500;
		body.error = `Already collecting to ${name} under taskId ${alreadyRunningtaskId}!`;
		DEBUG && log.info(`alreadyRunningtaskId:${alreadyRunningtaskId}`);
	} else {
		const readConnection = connect({
			principals: [PRINCIPAL_EXPLORER_READ]
		});
		const collectionNode = getCollection({
			connection: readConnection,
			name
		});
		DEBUG && log.info(`collectionNode:${toStr(collectionNode)}`);

		const {
			collector: {
				name: currentCollectorId,
				configJson: incomingConfigJson
			}
		} = collectionNode;
		//log.debug(`currentCollectorId:${currentCollectorId} incomingConfigJson:${toStr(incomingConfigJson)}`);

		const config = incomingConfigJson
			? JSON.parse(incomingConfigJson)
			: collectionNode.collector.config;
		DEBUG && log.info(`config:${toStr(config)}`);

		const collector = queryCollectors({
			connection: readConnection
		}).hits.map(({
			appName,
			displayName,
			collectTaskName: taskName,
			configAssetPath
		}) => {
			return {
				application: appName,
				collectorId: `${appName}:${taskName}`,
				displayName,
				taskName,
				uri: assetUrl({
					application: appName,
					path: configAssetPath
				})
			};
		}).filter(({collectorId}) => collectorId === currentCollectorId)[0];
		//log.debug(`collector:${toStr({collector})}`);

		if (resume === 'true') { // Surgeon specific
			config.resume = true;
		}

		const configJson = JSON.stringify(config);
		DEBUG && log.info(`configJson:${toStr({configJson})}`);

		const submitTaskParams = {
			descriptor: collector.collectorId, // <appname>:<taskname>
			config: {
				name, // Collection name
				collectorId: collector.collectorId, // <appname>:<taskname>
				configJson
			}
		};
		DEBUG && log.info(`submitTaskParams:${toStr({submitTaskParams})}`);

		const taskId = submitTask(submitTaskParams);
		DEBUG && log.info(`taskId:${toStr({taskId})}`);

		body.messages = `Started collecting ${name} with taskId ${taskId}`;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
