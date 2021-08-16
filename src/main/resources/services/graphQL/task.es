import {
	COLON_SIGN,
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING/*,
	toStr*/
} from '@enonic/js-utils';
//import getIn from 'get-value';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';
import {list as listTasks} from '/lib/xp/task';

import {queryCollectorsResolver} from './collector';

const {
	createEnumType,
	createObjectType
} = newSchemaGenerator();


const ENUM_TASK_STATES = createEnumType({
	name: 'EnumTaskStates',
	values: [
		TASK_STATE_FAILED,
		TASK_STATE_FINISHED,
		TASK_STATE_RUNNING,
		TASK_STATE_WAITING
	]
});


const TASK_OBJECT_TYPE = createObjectType({
	name: 'Task',
	//description:,
	fields: {
		application: { type: nonNull(GraphQLString) },
		description: { type: nonNull(GraphQLString) },
		id: { type: nonNull(GraphQLString) },
		name: { type: nonNull(GraphQLString) },
		progress: { type: nonNull(createObjectType({
			name: 'TaskProgress',
			//description:,
			fields: {
				current: { type: nonNull(GraphQLInt) },
				info: { type: nonNull(GraphQLString) }, // TODO May be empty?
				total: { type: nonNull(GraphQLInt) }
			}
		})) },
		startTime: { type: nonNull(GraphQLString) },
		state: { type: nonNull(GraphQLString) },
		user: { type: nonNull(GraphQLString) }
	}
}); // TASK_OBJECT_TYPE


export const fieldTaskQuery = {
	args: {
		appName: GraphQLString, // Filter by appName // com.enonic.app.explorer
		name: GraphQLString, // com.enonic.app.explorer:webcrawl
		onlyRegisteredCollectorTasks: GraphQLBoolean,
		state: ENUM_TASK_STATES
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		const {
			appName = undefined,
			name,
			onlyRegisteredCollectorTasks = false,
			state
		} = env.args;
		//const activeCollections = {};
		let taskList = listTasks({
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
			const collectorsRes = queryCollectorsResolver();
			//log.info(`collectorsRes:${toStr(collectorsRes)}`);
			const registeredCollectors = {};
			collectorsRes.hits.forEach(({
				appName,
				collectTaskName
			}) => {
				registeredCollectors[`${appName}:${collectTaskName}`] = true;
			});
			//log.info(`registeredCollectors:${toStr(registeredCollectors)}`);
			taskList = taskList.filter(({name}) => registeredCollectors[name]);
			//log.info(`filtered taskList:${toStr(taskList)}`);
		} // if onlyRegisteredCollectorTasks

		if(appName) {
			taskList = taskList.filter(({name}) => name.startsWith(`${appName}${COLON_SIGN}`));
		}

		return taskList;
	},
	type: list(TASK_OBJECT_TYPE)
}; // fieldTaskQuery


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
