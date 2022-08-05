import type {Glue} from '../Glue';


import {
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING
} from '@enonic/js-utils';
import {
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_ENUM_TASK_STATES,
	GQL_TYPE_TASK
} from '../constants';


export function addTaskTypes({
	glue
} :{
	glue :Glue
}) {
	glue.addEnumType({
		name: GQL_ENUM_TASK_STATES,
		values: [
			TASK_STATE_FAILED,
			TASK_STATE_FINISHED,
			TASK_STATE_RUNNING,
			TASK_STATE_WAITING
		]
	});

	glue.addObjectType({
		name: GQL_TYPE_TASK,
		fields: {
			application: { type: nonNull(GraphQLString) },
			description: { type: nonNull(GraphQLString) },
			id: { type: nonNull(GraphQLString) },
			name: { type: nonNull(GraphQLString) },
			progress: { type: nonNull(glue.addObjectType({
				name: 'TaskProgress',
				fields: {
					current: { type: nonNull(GraphQLInt) },
					info: { type: nonNull(GraphQLString) }, // TODO May be empty?
					infoObj: { type: nonNull(GraphQLJson) },
					total: { type: nonNull(GraphQLInt) }
				}
			})) },
			startTime: { type: nonNull(GraphQLString) },
			state: { type: nonNull(GraphQLString) },
			user: { type: nonNull(GraphQLString) }
		}
	});
}
