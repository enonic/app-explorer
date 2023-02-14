import type {ScheduledJob} from './index.d';


import {parseExpression as parseCronExpression} from 'cron-parser';
import hash from 'object-hash';
import * as React from 'react';


const JOBS_GQL = `{
	listScheduledJobs {
    	collectionId
    	enabled
    	descriptor
    	schedule {
      	timeZone
      	type
      	value
    	}
	}
}`;


export function useScheduleState({
	propEnd,
	propNow,
	propProjects,
	propStart,
	propZoom,
	servicesBaseUrl
} :{
	servicesBaseUrl :string
	propEnd ?:Date
	propNow ?:Date
	propStart ?:Date
	propProjects ?:Array<ScheduledJob>
	propZoom ?:number
}) {
	const [key, setKey] = React.useState(hash(propProjects));
	const [projects, setProjects] = React.useState(propProjects);
	const [start, setStart] = React.useState(propStart);
	const [end, setEnd] = React.useState(propEnd);
	const [now/*, setNow*/] = React.useState(propNow);
	const [zoom, setZoom] = React.useState(propZoom);
	const [showDisabled, setShowDisabled] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const memoizedFetchJobs = React.useCallback(() => {
		setIsLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: JOBS_GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log('res', res);
				if (res && res.data && res.data.listScheduledJobs) {
					const updatedProjects = (showDisabled
						? res.data.listScheduledJobs
						: res.data.listScheduledJobs.filter(({enabled}) => enabled)
					).map(({
						collectionId,
						//descriptor,
						//enabled,
						schedule: {
							//timeZone,
							//type, // TODO: filter on CRON?
							value: cronExpression
						}
					} :ScheduledJob) => {
						const projectId = collectionId;
						const tasks = [];
						let taskCount = 1;
						try {
							const interval = parseCronExpression(cronExpression, {
								currentDate: start, // Start date of the iteration
								endDate: end, // End date of the iteration
								iterator: true//, // Return ES6 compatible iterator object
								//tz: 'Europe/Oslo' // Timezone string. It won't be used in case utc is enabled
								//tz: timeZone // Timezone string. It won't be used in case utc is enabled
								//utc: true // Enable UTC
							});
							while (true) { //eslint-disable-line no-constant-condition
								try {
									const obj = interval.next();
									//console.log('value:', obj.value.toString(), 'done:', obj.done);
									const taskId = `${projectId}.${taskCount}`;
									const taskStart = new Date(obj.value as unknown as Date); // CronDate
									const taskEnd = new Date(taskStart.getTime());
									taskEnd.setHours( taskEnd.getHours() + 1 );
									tasks.push({
										id: taskId,
										title: taskId,
										start: taskStart,
										end: taskEnd
									});
									taskCount++;
									if (taskCount > 7) {
										break; // If someone has put in a cron expression witch executes every second!
									}
								} catch (e) {
									//console.error('Inner: ' + e.message, e);
									break; // The while
								}
							} // while
						} catch (err) {
							console.error('Outer: ' + err.message, err);
						}
						//console.debug('tasks',tasks);
						return {
							id: projectId,
							title: projectId,
							tasks
						};
					}); // updatedProjects
					setProjects(updatedProjects);
					setIsLoading(false);
				}
			});
	}, [end, servicesBaseUrl, showDisabled, start]);

	React.useEffect(memoizedFetchJobs, [memoizedFetchJobs]);

	// It seems the Gantt component doesn't update or render when the projects prop is changed.
	// By changing key we can force a re-mount.
	React.useEffect(()=> {
		setKey(hash(projects));
	}, [projects]);
	return {
		end,
		isLoading,
		key,
		memoizedFetchJobs,
		now,
		projects,
		setEnd,
		setShowDisabled,
		setStart,
		setZoom,
		showDisabled,
		start,
		zoom
	};
}
