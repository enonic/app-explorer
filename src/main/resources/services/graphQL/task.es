//import getIn from 'get-value';
import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
//import {toStr} from '/lib/util';
import {list as listTasks} from '/lib/xp/task';


import {queryCollectorsResolver} from './collector';


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


export const queryTasks = {
	args: {
		name: GraphQLString, // com.enonic.app.explorer:webcrawl
		onlyRegisteredCollectorTasks: GraphQLBoolean,
		state: GraphQLString // WAITING | RUNNING | FINISHED | FAILED
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		const {
			name,
			onlyRegisteredCollectorTasks = true,
			state
		} = env.args;
		//const activeCollections = {};
		let taskList = listTasks({
			name,
			state
		});

		if (onlyRegisteredCollectorTasks) {
			const collectorsRes = queryCollectorsResolver();
			//log.info(`collectorsRes:${toStr(collectorsRes)}`);
			const registeredCollectors = {};
			collectorsRes.hits.forEach(({_name}) => {
				registeredCollectors[_name] = true;
			});
			//log.info(`registeredCollectors:${toStr(registeredCollectors)}`);
			taskList = taskList.filter(({name}) => registeredCollectors[name]);
		} // if onlyRegisteredCollectorTasks

		return taskList;
	},
	type: list(TASK_OBJECT_TYPE)
}; // queryTasks


/* Example query
{
	queryTasks(
		name: "com.enonic.app.explorer:webcrawl"
		onlyRegisteredCollectorTasks: false
		state: "RUNNING"
	) {
		application
		description
		id
		name
		progress {
			current
			info
			total
		}
		startTime
		state
		user
	}
}
*/
