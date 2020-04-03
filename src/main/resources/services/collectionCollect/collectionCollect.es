import {toStr} from '/lib/util';
import {assetUrl} from '/lib/xp/portal';
import {submitNamed} from '/lib/xp/task';

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
		DEBUG && log.info(`currentCollectorId:${currentCollectorId} incomingConfigJson:${toStr(incomingConfigJson)}`);

		const config = incomingConfigJson
			? JSON.parse(incomingConfigJson)
			: collectionNode.collector.config;
		DEBUG && log.info(`config:${toStr(config)}`);

		const collector = queryCollectors({
			connection: readConnection
		}).hits.map(({
			_name: collectorId,
			appName,
			displayName,
			collectTaskName: taskName,
			configAssetPath
		}) => {
			return {
				application: appName,
				collectorId,
				displayName,
				taskName,
				uri: assetUrl({
					application: appName,
					path: configAssetPath
				})
			};
		}).filter(({collectorId}) => collectorId === currentCollectorId)[0];
		DEBUG && log.info(`collector:${toStr({collector})}`);

		if (resume === 'true') { // Surgeon specific
			config.resume = true;
		}

		const configJson = JSON.stringify(config);
		DEBUG && log.info(`configJson:${toStr({configJson})}`);

		const submitNamedParams = {
			name: collector.collectorId, // <appname>:<taskname>
			config: {
				name, // Collection name
				collectorId: collector.collectorId, // <appname>:<taskname>
				configJson
			}
		};
		DEBUG && log.info(`submitNamedParams:${toStr({submitNamedParams})}`);

		const taskId = submitNamed(submitNamedParams);
		DEBUG && log.info(`taskId:${toStr({taskId})}`);

		body.messages = `Started collecting ${name} with taskId ${taskId}`;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
