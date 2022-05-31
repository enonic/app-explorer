import {parseExpression as parseCronExpression} from 'cron-parser';
import Gantt from 'nice-react-gantt';
import hash from 'object-hash';
import * as React from 'react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import {Slider} from 'react-semantic-ui-range';
import {Label, Radio, Segment, Table} from 'semantic-ui-react';

import {useInterval} from './utils/useInterval';


type ScheduledJob = {
	collectionId :string
	enabled :boolean
	schedule :{
		value :string
	}
}


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


export const Schedule = (props :{
	servicesBaseUrl :string
	now ?:Date
	start ?:Date
	end ?:Date
	zoom ?:number
	projects ?:Array<ScheduledJob>
}) => {
	const {
		servicesBaseUrl,
		now: propNow = new Date(Date.now()),
		start: propStart = new Date(propNow.getTime() - 1*24*3600*1000),
		end: propEnd = new Date(propStart.getTime() + 8*24*3600*1000),
		zoom: propZoom = 1,
		projects: propProjects = []
	} = props;

	const [key, setKey] = React.useState(hash(propProjects));
	const [projects, setProjects] = React.useState(propProjects);
	const [start, setStart] = React.useState(propStart);
	const [end, setEnd] = React.useState(propEnd);
	const [now/*, setNow*/] = React.useState(propNow);
	const [zoom, setZoom] = React.useState(propZoom);

	const [showDisabled, setShowDisabled] = React.useState(false);

	const memoizedFetchJobs = React.useCallback(() => {
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
									var obj = interval.next();
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
				}
			});
	}, [end, servicesBaseUrl, showDisabled, start]);

	React.useEffect(memoizedFetchJobs, [memoizedFetchJobs]);

	useInterval(() => {
		// This will continue to run as long as the Schedule "tab" is open
		//if (boolPoll) {
		memoizedFetchJobs();
	}, 5000);

	// It seems the Gantt component doesn't update or render when the projects prop is changed.
	// By changing key we can force a re-mount.
	React.useEffect(()=> {
		//setKey(uuidv4()); // Happens twice for some reason, so:
		// TODO: Make a checksum of projects instead, less flashing
		setKey(hash(projects));
	}, [projects]);

	// Gantt is a functional component
	// It has const [_projects, setProjects] = useState(projects)
	// It doesn't have useEffect on projects, but on end, start and zoom
	//console.debug('key', key);

	return <>
		<Segment basic className="page">
			<Table celled basic compact>
			 	<Table.Header>
					<Table.Row verticalAlign='bottom'>
						<Table.HeaderCell collapsing>
							Start date
						</Table.HeaderCell>
						<Table.HeaderCell collapsing>
							End date
						</Table.HeaderCell>
						<Table.HeaderCell collapsing>
							Show disabled
						</Table.HeaderCell>
						<Table.HeaderCell>
							Zoom
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							{/*maxDate={() => new Date(end.getTime() - 1*24*3600*1000)}*/}
							<SemanticDatepicker
								clearable={false}
								datePickerOnly={true}
								firstDayOfWeek={1}
								inverted
								onChange={(
									//@ts-ignore
									event,
									{value}
								) => setStart(value as Date)}
								showOutsideDays={false}
								value={start}
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							{/*minDate={() => new Date(start.getTime() + 1*24*3600*1000)}*/}
							<SemanticDatepicker
								clearable={false}
								datePickerOnly={true}
								firstDayOfWeek={1}
								inverted
								onChange={(
									//@ts-ignore
									event,
									{value}
								) => setEnd(value as Date)}
								showOutsideDays={false}
								showToday={false}
								value={end}
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showDisabled}
								onChange={(
									//@ts-ignore
									event,
									{checked}
								) => {
									setShowDisabled(checked);
								}}
								toggle
							/>
						</Table.Cell>
						<Table.Cell>
							<Slider
								color='blue'
								inverted
								settings={{
									min: 0,
									max: 5,
									start: propZoom,
									step: 0.1,
									onChange: (value :number) => setZoom(value)
								}}
								value={zoom}
							/>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Gantt
			key={key}
			start={start}
			end={end}
			now={now}
			zoom={zoom}
			projects={projects}
			enableSticky
			scrollToNow
			sideWidth={400}
		/>
	</>;
};

// Other options:
// frappe-gantt-react
// mermaid
// react-gantt-antd-pt
// react-gantt-antd-hzm
// react-gantt-antd

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


export const Schedule = (props) => {
	const {
		servicesBaseUrl
	} = props;
	return <>
		<h1>Schedule</h1>
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
