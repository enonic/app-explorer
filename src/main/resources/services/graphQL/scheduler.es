//import {listExplorerJobs} from '/lib/explorer/scheduler/listExplorerJobs';
//import {toStr} from '/lib/util';
import {list as listJobs} from '/lib/xp/scheduler';

import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	//GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';


export const listScheduledJobs = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);
		//const scheduledJobs = listExplorerJobs()
		const scheduledJobs = listJobs()
			.filter(({descriptor}) => descriptor.startsWith('com.enonic.app.explorer'))
			.map(({
				config: {
					name: collectionName
				},
				descriptor,
				enabled,
				schedule
			}) => ({
				collectionName,
				descriptor,
				enabled,
				schedule
			}));
		//log.info(`scheduledJobs:${toStr(scheduledJobs)}`);
		return scheduledJobs;
	}, // resolve
	type: list(createObjectType({
		name: 'ScheduledJob',
		fields: {
			collectionName: { type: nonNull(GraphQLString) },
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
	})) // type list
}; // listScheduledJobs


/* Example query
{
	listScheduledJobs {
		collectionName
		descriptor
		enabled
		schedule {
			timeZone
			type
			value
		}
	}
}
*/
