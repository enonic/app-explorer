import { FrappeGantt } from 'frappe-gantt-react';


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
			viewMode={this.state.mode}
			onClick={task => console.log(task)}
			onDateChange={(task, start, end) => console.log(task, start, end)}
			onProgressChange={(task, progress) => console.log(task, progress)}
			onTasksChange={tasks => console.log(tasks)}
		/>
	</>;
}
