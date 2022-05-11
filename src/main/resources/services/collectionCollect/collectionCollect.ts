import {
	RESPONSE_TYPE_JSON,
	toStr
} from '@enonic/js-utils';

//@ts-ignore
import {assetUrl} from '/lib/xp/portal';
//@ts-ignore
import {submitTask} from '/lib/xp/task';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {get as getCollection} from '/lib/explorer/collection/get';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {getTasksWithPropertyValue} from '/lib/explorer/task/getTasksWithPropertyValue';


const DEBUG = false;


export function post({
	params: {
		id: collectionId,
		name: collectionName,
		resume = false
	}
}) {
	DEBUG && log.debug('collectionId:%s collectionName:%s resume:%s', collectionId, collectionName, resume);

	const runningTasksWithName = getTasksWithPropertyValue({
		value: collectionName,
		state: 'RUNNING'
	});
	DEBUG && log.debug(`runningTasksWithName:${runningTasksWithName}`);

	if (runningTasksWithName.length) {
		const alreadyRunningtaskId = runningTasksWithName[0].id;
		DEBUG && log.debug(`alreadyRunningtaskId:${alreadyRunningtaskId}`);
		return {
			body: {
				error: `Already collecting to ${collectionName} under taskId ${alreadyRunningtaskId}!`
			},
			contentType: RESPONSE_TYPE_JSON,
			status: 500
		};
	}

	const readConnection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});

	const collectionNode = getCollection({
		connection: readConnection,
		name: collectionName
	});
	DEBUG && log.debug(`collectionNode:${toStr(collectionNode)}`);

	const {
		collector: {
			name: currentCollectorId,
			configJson: incomingConfigJson
		},
		language
	} = collectionNode;
	//log.debug(`currentCollectorId:${currentCollectorId} incomingConfigJson:${toStr(incomingConfigJson)}`);

	const config = incomingConfigJson
		? JSON.parse(incomingConfigJson)
		: collectionNode.collector.config;
	DEBUG && log.debug(`config:${toStr(config)}`);

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
	DEBUG && log.debug(`configJson:${toStr({configJson})}`);

	const submitTaskParams = {
		descriptor: collector.collectorId, // <appname>:<taskname>
		config: {
			//name, // Collection name
			collectionId,
			collectorId: collector.collectorId, // <appname>:<taskname>
			configJson,
			language
		}
	};
	DEBUG && log.debug(`submitTaskParams:${toStr({submitTaskParams})}`);

	const taskId = submitTask(submitTaskParams);
	DEBUG && log.debug(`taskId:${toStr({taskId})}`);

	return {
		body: {
			messages: `Started collecting ${collectionName} with taskId ${taskId}`
		},
		contentType: RESPONSE_TYPE_JSON,
		status: 200
	};
} // post
