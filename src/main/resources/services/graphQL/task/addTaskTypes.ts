import type {Glue} from '../Glue';

import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_TYPE_TASK,
	GQL_TYPE_TASK_SUBMITTED
} from '../constants';


export function addTaskTypes({
	glue
} :{
	glue :Glue
}) {
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

	glue.addObjectType({
		name: GQL_TYPE_TASK_SUBMITTED,
		fields: {
			taskId: { type: nonNull(GraphQLID) }
		}
	});
}
