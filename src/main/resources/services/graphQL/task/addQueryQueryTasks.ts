import type {Task} from '/lib/explorer/types/'
import type {Glue} from '../Glue';


import {
	COLON_SIGN,
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING/*,
	toStr*/
} from '@enonic/js-utils';
import {
	GraphQLBoolean,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {list as listTasks} from '/lib/xp/task';
import {queryCollectors} from '../collector/queryCollectors';
import {
	GQL_ENUM_TASK_STATES,
	GQL_TYPE_TASK
} from '../constants';


export function addQueryQueryTasks({
	glue
} :{
	glue :Glue
}) {
	return glue.addQuery<{
		appName ?:string
		name ?:string
		onlyRegisteredCollectorTasks ?:boolean
		state ?:typeof TASK_STATE_FAILED|typeof TASK_STATE_FINISHED|typeof TASK_STATE_RUNNING|typeof TASK_STATE_WAITING
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
				onlyRegisteredCollectorTasks = false,
				state
			}
		}) {
			//const activeCollections = {};
			let taskList :Array<Task> = listTasks({
				name,
				state
			});
			//log.info(`taskList:${toStr(taskList)}`);

			/*{
			    "description": "Collect",
			    "id": "c4e62533-4853-4da2-998a-096cc3c783fb",
			    "name": "com.enonic.app.explorer:webcrawl",
			    "state": "RUNNING",
			    "application": "com.enonic.app.explorer",
			    "user": "user:system:su",
			    "startTime": "2021-06-16T12:09:41.477186Z",
			    "progress": {
			        "info": "{\"name\":\"a-enonic-com\",\"message\":\"Processing https://www.enonic.com/\",\"startTime\":1623845381500,\"currentTime\":1623845382453,\"uri\":\"https://www.enonic.com/\"}",
			        "current": 0,
			        "total": 1
			    }
			}*/

			if (onlyRegisteredCollectorTasks) {
				const collectorsRes = queryCollectors();
				//log.info(`collectorsRes:${toStr(collectorsRes)}`);
				const registeredCollectors = {};
				collectorsRes.hits.forEach(({
					appName,
					taskName
				}) => {
					registeredCollectors[`${appName}:${taskName}`] = true;
				});
				//log.info(`registeredCollectors:${toStr(registeredCollectors)}`);
				taskList = taskList.filter(({name}) => registeredCollectors[name]);
				//log.info(`filtered taskList:${toStr(taskList)}`);
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
					log.warning(`Unable to JSON.parse task.progress.info:${task.progress.info} taskId:${taskId}`);
					task.progress.infoObj = {}; // satisfy nonNull
				}
			}

			return taskList;
		},
		type: list(glue.getObjectType(GQL_TYPE_TASK))
	});
}

/* Example query
query GetTasks(
  $descriptor: String,
  $onlyRegisteredCollectorTasks: Boolean,
  $state: String
) {
	queryTasks(
		name: $descriptor
		onlyRegisteredCollectorTasks: $onlyRegisteredCollectorTasks
		state: $state
	) {
		application
		description
		id
		name
		progress {
			current
			info # Can be JSON
			total
		}
		startTime
		state
		user
	}
}
*/
