//import {parse as parseCookie} from 'cookie';

//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {assetUrl} from '/lib/xp/portal';
import {submitNamed} from '/lib/xp/task';
import {request as httpClientRequest} from '/lib/http-client';
import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {get as getCollection} from '/lib/explorer/collection/get';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {getTasksWithPropertyValue} from '/lib/explorer/task/getTasksWithPropertyValue';


//import {TASK_COLLECT} from '/lib/explorer/model/2/constants';



export const collect = ({
	path,
	method,
	params: {
		resume
	}
}) => {
	//log.info(toStr({path, method}));

	const relPath = path.replace(TOOL_PATH, '');

	const pathParts = relPath.match(/[^/]+/g);
	const collectionName = pathParts[2];

	const messages = [];
	let status = 200;

	const runningTasksWithName = getTasksWithPropertyValue({
		value: collectionName,
		state: 'RUNNING'
	});
	if (runningTasksWithName.length) {
		const alreadyRunningtaskId = runningTasksWithName[0].id;
		status = 500;
		messages.push(`Already collecting to ${collectionName} under taskId ${alreadyRunningtaskId}!`);
		//log.info(toStr({alreadyRunningtaskId}));
	} else {
		const connection = connect({
			principals: [PRINCIPAL_EXPLORER_READ]
		});
		const collectionNode = getCollection({
			connection,
			name: collectionName
		});
		//log.info(toStr({collectionNode}));

		const {
			_name: name,
			collector: {
				name: collectorName,
				configJson: incomingConfigJson
			}
		} = collectionNode;
		const config = incomingConfigJson
			? JSON.parse(incomingConfigJson)
			: collectionNode.collector.config;
		//log.info(toStr({name, collectorName/*, config*/}));

		const collector = queryCollectors({
			connection
		}).hits.map(({
			_name: application,
			displayName,
			collectTaskName: taskName,
			configAssetPath
		}) => {
			return {
				application,
				displayName,
				taskName,
				uri: assetUrl({
					application,
					path: configAssetPath
				})
			};
		}).filter(({application}) => application === collectorName)[0];
		//log.info(toStr({collector}));

		if (resume === 'true') { // Surgeon specific
			config.resume = true;
		}

		const configJson = JSON.stringify(config);
		//log.info(toStr({configJson}));

		const submitNamedParams = {
			name: `${collector.application}:${collector.taskName}`, // Task name
			config: {
				name, // Collection name
				configJson
			}
		};
		//log.info(toStr({submitNamedParams}));

		const taskId = submitNamed(submitNamedParams);
		messages.push(`Started collecting ${collectionName} with taskId ${taskId}`);
		//log.info(toStr({taskId}));
	}
	return {
		redirect: `${TOOL_PATH}/collections/status?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
}; // collect
