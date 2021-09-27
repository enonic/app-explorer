import {
	GraphQLBoolean,
	GraphQLString,
	nonNull
} from '/lib/graphql';


export function generateSchedulerTypes({
	GQL_TYPE_ID,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	return {
		GQL_TYPE_JOB: createObjectType({
			name: 'ScheduledJob',
			fields: {
				collectionId: { type: GQL_TYPE_ID },
				descriptor: { type: nonNull(GraphQLString) },
				enabled: { type: nonNull(GraphQLBoolean) },
				schedule: { type: nonNull(createObjectType({
					name: 'ScheduledJobCalendar',
					fields: {
						timeZone: { type: nonNull(GraphQLString) },
						type: { type: nonNull(GraphQLString) },
						value: { type: nonNull(GraphQLString) }
					} // fields
				}))} // schedule
			} // fields
		})
	};
}
