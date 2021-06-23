import {parseExpression as parseCronExpression} from 'cron-parser';
import Gantt from 'nice-react-gantt';
//import useForceUpdate from 'use-force-update';
//import useStateRef from 'react-usestateref'

//import {useInterval} from './utils/useInterval';


const JOBS_GQL = `{
	listScheduledJobs {
    	collectionName
    	enabled
    	descriptor
    	schedule {
      	timeZone
      	type
      	value
    	}
	}
}`;


function fetchData({
	end,
	now,
	servicesBaseUrl,
	setProjects
}) {
	fetch(`${servicesBaseUrl}/graphQL`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: JOBS_GQL })
	})
		.then(res => res.json())
		.then(res => {
			//console.log('res', res);
			if (res && res.data && res.data.listScheduledJobs) {
				setProjects(res.data.listScheduledJobs.filter(({enabled}) => enabled).map(({
					collectionName,
					//descriptor,
					//enabled,
					schedule: {
						//timeZone,
						//type, // TODO: filter on CRON?
						value: cronExpression
					}
				}) => {
					const projectId = collectionName;
					const tasks = [];
					let taskCount = 1;
					try {
						const interval = parseCronExpression(cronExpression, {
							currentDate: now, // Start date of the iteration
							endDate: end, // End date of the iteration
							iterator: true//, // Return ES6 compatible iterator object
							//tz: 'Europe/Oslo' // Timezone string. It won't be used in case utc is enabled
							//tz: timeZone // Timezone string. It won't be used in case utc is enabled
							//utc: true // Enable UTC
						});
						while (true) { //eslint-disable-line no-constant-condition
							try {
								var obj = interval.next();
								//console.log('value:', obj.value.toString(), 'done:', obj.done);
								const taskId = `${projectId}.${taskCount}`;
								const taskStart = new Date(obj.value);
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
				})); // map
			}
		});
} // fetchData


export const Scheduling = (props) => {
	//const forceUpdate = useForceUpdate();
	const {
		servicesBaseUrl,
		now: propNow = new Date(Date.now()),
		start: propStart = new Date(propNow.getTime() - 1*24*3600*1000),
		end: propEnd = new Date(propStart.getTime() + 8*24*3600*1000),
		zoom: propZoom = 1,
		projects: propProjects = [{
			id: "project1",
			title: "Project 1",
			tasks: [{
				id: "task1",
				title: "Task 1",
				start: new Date(Date.now() + 1*3600*1000),
				end: new Date(Date.now() + 2*3600*1000)
			}]//,
			//projects: sub_projects,
			//isOpen: false
		}]
	} = props;

	const [projects, setProjects] = React.useState(propProjects);
	//let [projects = propProjects, setProjects] = React.useState();
	//let [projects = propProjects, setProjects, projectsRef] = useStateRef()

	const [start/*, setStart*/] = React.useState(propStart);
	const [end/*, setEnd*/] = React.useState(propEnd);
	const [now/*, setNow*/] = React.useState(propNow);
	const [zoom/*, setZoom*/] = React.useState(propZoom);



	React.useEffect(() => {
		//console.debug('projects inside useEffect before', projects);
		fetchData({
			end,
			now,
			servicesBaseUrl,
			setProjects
		});
		//console.debug('projects inside useEffect after', projects);
	}, [end, now, servicesBaseUrl]); // Only once

	/*React.useEffect(() => {
		forceUpdate();
	}, [projects]);*/

	/*useInterval(() => {
		console.debug('useInterval');
		//forceUpdate();
		// This will continue to run as long as the Scheduling "tab" is open
		//if (boolPoll) {
		//console.debug('projects inside useInterval before', projects);
		//fetchData();
		//console.debug('projects inside useInterval after', projects);
		//}
	}, 5000);*/

	console.debug('projects outside', projects);

	// Gantt is a functional component
	// It has const [_projects, setProjects] = useState(projects)
	// It doesn't have useEffect on projects, but on end, start and zoom
	// key={projects/*Force re-render*/} // Didn't work!
	return <Gantt
		start={start}
		end={end}
		now={now}
		zoom={zoom}
		projects={projects}
		enableSticky
		scrollToNow
	/>;
};

// Other options:
// frappe-gantt-react
// mermaid
// react-gantt-antd-pt
// react-gantt-antd-hzm
// react-gantt-antd

// Licensed:
// gantt-schedule-timeline-calendar
// gojs

/*
//import { FrappeGantt } from 'frappe-gantt-react';

const TASKS = [{
	id: 'Task 1',
	name: 'Redesign website',
	start: '2016-12-28',
	end: '2016-12-31',
	progress: 20,
	dependencies: 'Task 2, Task 3',
	custom_class: 'bar-milestone' // optional
}];

//view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
//const VIEW_MODE = 'Week';


export const Scheduling = (props) => {
	const {
		servicesBaseUrl
	} = props;
	return <>
		<h1>Scheduling</h1>
		<FrappeGantt
			tasks={TASKS}
			viewMode={'Week'/*this.state.mode this is undefined}
			onClick={task => console.log(task)}
			onDateChange={(task, start, end) => console.log(task, start, end)}
			onProgressChange={(task, progress) => console.log(task, progress)}
			onTasksChange={tasks => console.log(tasks)}
		/>
	</>;
}
*/
