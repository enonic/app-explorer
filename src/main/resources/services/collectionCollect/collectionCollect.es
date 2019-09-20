//import {toStr} from '/lib/util';
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


export function post({
	params: {
		name,
		resume = false
	}
}) {
	//log.info(`name:${name} resume:${resume}`);
	const body = {};
	let status = 200;

	const runningTasksWithName = getTasksWithPropertyValue({
		value: name,
		state: 'RUNNING'
	});

	if (runningTasksWithName.length) {
		const alreadyRunningtaskId = runningTasksWithName[0].id;
		status = 500;
		body.error = `Already collecting to ${name} under taskId ${alreadyRunningtaskId}!`;
		//log.info(toStr({alreadyRunningtaskId}));
	} else {
		const connection = connect({
			principals: [PRINCIPAL_EXPLORER_READ]
		});
		const collectionNode = getCollection({
			connection,
			name
		});
		//log.info(toStr({collectionNode}));

		const {
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
		body.messages = `Started collecting ${name} with taskId ${taskId}`;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
