import {
	GraphQLBoolean,
	GraphQLString,
	nonNull
} from '/lib/graphql';

import {GQL_TYPE_JOB_NAME} from '../constants';


export function generateSchedulerTypes({
	glue
}) {
	glue.addObjectType({
		name: GQL_TYPE_JOB_NAME,
		fields: {
			collectionId: { type: glue.getScalarType('_id') },
			descriptor: { type: nonNull(GraphQLString) },
			enabled: { type: nonNull(GraphQLBoolean) },
			schedule: { type: nonNull(glue.addObjectType({
				name: 'ScheduledJobCalendar',
				fields: {
					timeZone: { type: nonNull(GraphQLString) },
					type: { type: nonNull(GraphQLString) },
					value: { type: nonNull(GraphQLString) }
				} // fields
			}))} // schedule
		} // fields
	});
}
