//import {toStr} from '@enonic/js-utils';

import {APP_EXPLORER} from '/lib/explorer/index';
//@ts-ignore
import {list} from '/lib/graphql';
//@ts-ignore
import {list as listJobs} from '/lib/xp/scheduler';


import {GQL_TYPE_JOB_NAME} from '../constants';


export function generateScheduledJobsListField({
	glue
}) {
	return {
		resolve: (/*env*/) => {
			//log.debug(`env:${toStr(env)}`);
			const scheduledJobs = listJobs()
				.filter(({descriptor}) => descriptor.startsWith(APP_EXPLORER))
				.map(({
					config: {
						collectionId,
						name: collectionName
					},
					descriptor,
					enabled,
					schedule
				}) => ({
					collectionId,
					collectionName,
					descriptor,
					enabled,
					schedule
				}));
			//log.debug(`scheduledJobs:${toStr(scheduledJobs)}`);
			return scheduledJobs;
		}, // resolve
		type: list(glue.getObjectType(GQL_TYPE_JOB_NAME))
	};
}


/* Example query
{
	listScheduledJobs {
		collectionId
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
