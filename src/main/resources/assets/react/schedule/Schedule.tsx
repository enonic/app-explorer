import type {ScheduledJob} from './index.d';


import Gantt from 'nice-react-gantt';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import {Slider} from 'react-semantic-ui-range';
import {
	Radio,
	Table
} from 'semantic-ui-react';
import RefreshButton from '../components/buttons/RefreshButton';
import Flex from '../components/Flex';
import {useScheduleState} from './useScheduleState';


export const Schedule = ({
	servicesBaseUrl,
	now: propNow = new Date(Date.now()),
	start: propStart = new Date(propNow.getTime() - 1*24*3600*1000),
	end: propEnd = new Date(propStart.getTime() + 8*24*3600*1000),
	zoom: propZoom = 1,
	projects: propProjects = []
} :{
	servicesBaseUrl :string
	now ?:Date
	start ?:Date
	end ?:Date
	zoom ?:number
	projects ?:Array<ScheduledJob>
}) => {
	const {
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
	} = useScheduleState({
		propEnd,
		propNow,
		propProjects,
		propStart,
		propZoom,
		servicesBaseUrl
	});

	// Gantt is a functional component
	// It has const [_projects, setProjects] = useState(projects)
	// It doesn't have useEffect on projects, but on end, start and zoom
	//console.debug('key', key);

	return <>
		<Flex
			className='mt-1rem'
			justifyContent='center'>
			<Flex.Item
				className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown w-mi-tabletExceptGutters-tabletUp'
				overflowX='overlay'
			>
				<Flex
					justifyContent='space-between'
					gap
					marginBottom
				>
					<Flex.Item>
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
									<Table.HeaderCell style={{width:200}}>
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
											disabled={isLoading}
											firstDayOfWeek={1}
											inverted
											loading={isLoading}
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
											disabled={isLoading}
											firstDayOfWeek={1}
											inverted
											loading={isLoading}
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
											disabled={isLoading}
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
											disabled={isLoading}
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
					</Flex.Item>
					<Flex.Item>
						<RefreshButton
							loading={isLoading}
							onClick={memoizedFetchJobs}
						/>
					</Flex.Item>
				</Flex>
			</Flex.Item>
		</Flex>
		<Flex
			justifyContent='center'>
			<Flex.Item
				className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown w-mi-tabletExceptGutters-tabletUp'
				overflowX='overlay'
			>
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
			</Flex.Item>
		</Flex>
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
