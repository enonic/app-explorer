import type {Task} from '@enonic-types/lib-explorer'
import type {Glue} from '../Glue';


import {
	COLON_SIGN,
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING
} from '@enonic/js-utils';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {
	GraphQLBoolean,
	GraphQLString,
	list
	// @ts-expect-error No types yet.
} from '/lib/graphql';
import {list as listTasks} from '/lib/xp/task';
import {queryCollectors} from '../collector/queryCollectors';
import {
	GQL_ENUM_TASK_STATES,
	GQL_TYPE_TASK
} from '../constants';


export function addQueryQueryTasks({
	glue
}: {
	glue: Glue
}) {
	return glue.addQuery<{
		appName?: string
		name?: string
		onlyRegisteredCollectorTasks?: boolean
		state?: typeof TASK_STATE_FAILED|typeof TASK_STATE_FINISHED|typeof TASK_STATE_RUNNING|typeof TASK_STATE_WAITING
	}>({
		name: 'queryTasks',
		args: {
			appName: GraphQLString, // Filter by appName // com.enonic.app.explorer
			name: GraphQLString, // com.enonic.app.explorer:webcrawl
			onlyRegisteredCollectorTasks: GraphQLBoolean,
			state: glue.getEnumType(GQL_ENUM_TASK_STATES)
		},
		resolve({
			args: {
				appName = undefined,
				name,
				onlyRegisteredCollectorTasks = true,
				state
			}
		}) {
			// log.info('onlyRegisteredCollectorTasks:%s', onlyRegisteredCollectorTasks);

			let taskList: Task[] = listTasks({
				name,
				state
			});
			// log.info('taskList:%s', toStr(taskList));

			if (onlyRegisteredCollectorTasks) {
				const collectorsRes = queryCollectors();
				// log.info('collectorsRes:%s', toStr(collectorsRes));

				const registeredCollectors = {};
				collectorsRes.hits.forEach(({
					appName,
					taskName
				}) => {
					registeredCollectors[`${appName}:${taskName}`] = true;
				});
				// log.info('registeredCollectors:%s', toStr(registeredCollectors));

				taskList = taskList.filter(({name}) => registeredCollectors[name]);
				// log.info('filtered taskList:%s', toStr(taskList));
			} // if onlyRegisteredCollectorTasks

			if(appName) {
				taskList = taskList.filter(({name}) => name.startsWith(`${appName}${COLON_SIGN}`));
			}

			for (let i = 0; i < taskList.length; i++) {
				const task = taskList[i];
				const {id: taskId} = task;
				try {
					task.progress.infoObj = JSON.parse(task.progress.info);
				} catch (e) {
					log.debug(`Unable to JSON.parse task.progress.info:${task.progress.info} taskId:${taskId}`);
					task.progress.infoObj = {}; // satisfy nonNull
				}
			}

			return taskList;
		},
		type: list(glue.getObjectType(GQL_TYPE_TASK))
	});
}
