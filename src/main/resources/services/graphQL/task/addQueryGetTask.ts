import type {Task} from '@enonic-types/lib-explorer/'
import type {Glue} from '../Glue';

//@ts-ignore
import {GraphQLID} from '/lib/graphql';
//@ts-ignore
import {get as getTask} from '/lib/xp/task';
import {
	GQL_TYPE_TASK
} from '../constants';


export function addQueryGetTask({
	glue
} :{
	glue :Glue
}) {
	return glue.addQuery<{
		taskId :string
	}>({
		name: 'getTask',
		args: {
			taskId :GraphQLID
		},
		resolve({
			args: {
				taskId
			}
		}) {
			const task :Task = getTask(taskId);
			try {
				task.progress.infoObj = JSON.parse(task.progress.info);
			} catch (e) {
				log.debug(`Unable to JSON.parse task.progress.info:${task.progress.info} taskId:${taskId}`);
				task.progress.infoObj = {}; // satisfy nonNull
			}
			return task;
		},
		type: glue.getObjectType(GQL_TYPE_TASK)
	});
}
