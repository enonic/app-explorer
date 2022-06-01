import type {StrictTableHeaderCellProps} from 'semantic-ui-react';


import {
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING//,
	//toStr
} from '@enonic/js-utils';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import prettyMs from 'pretty-ms';
import * as React from 'react';
import {Dropdown, Form, Header, Table} from 'semantic-ui-react';

import {useInterval} from './utils/useInterval';


const DIRECTION_ASCENDING = 'ascending';
const DIRECTION_DESCENDING = 'descending';


type Direction = StrictTableHeaderCellProps['sorted'];

type TaskState =
	| typeof TASK_STATE_FAILED
	| typeof TASK_STATE_FINISHED
	| typeof TASK_STATE_RUNNING
	| typeof TASK_STATE_WAITING

type Collector = {
	averageMs :number
	collection :string
	current :number
	currentTime :number
	durationMs :number
	etaMs :number
	message :string
	percent :number
	remainingCount :number
	remainingMs :number
	startTime :number
	state :TaskState
	total :number
}

type StatusComponentState = {
	collectors :Array<Collector>
	column :string
	direction :Direction
	isLoading :boolean
}

const FORMAT = 'YYYY-MM-DD hh:mm:ss';


function taskStateToProgressClassName(state :TaskState) {
	switch (state) {
	case TASK_STATE_RUNNING: return 'active';
	case TASK_STATE_FINISHED: return 'success';
	case TASK_STATE_WAITING: return 'warning';
	//case TASK_STATE_FAILED: return 'error';
	default: return 'error';
	}
}


export function Status (props :{
	servicesBaseUrl :string
}) {
	const {
		//setTasks, // Application wide state has side-effects :(
		//tasks, // Application wide state has side-effects :(
		servicesBaseUrl
		//websocket
	} = props;

	const [delay, setDelay] = React.useState(5000);
	const [state, setState] = React.useState<StatusComponentState>({
		collectors: [],
		column: 'startTime',
		direction: DIRECTION_ASCENDING,
		isLoading: false
	});
	const [tasks, setTasks] = React.useState([]);

	function updateTasks() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `{ queryTasks {
				application
				description
				id
				name
				progress {
					current
					info
					total
				}
				startTime
				state
				user
			}}` })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data && res.data.queryTasks) {
					setTasks(res.data.queryTasks);
				}
			});
	} // updateTasks

	function sortCollectors({
		collectors,
		column,
		direction
	} :{
		collectors :Array<Collector>
		column :string
		direction :Direction
	}) {
		const sorted = _.sortBy(collectors, column);
		if(direction === DIRECTION_DESCENDING) {
			return sorted.reverse();
		}
		return sorted;
	} // sortCollectors

	React.useEffect(() => { // Only on first render, not updates
		//websocket && websocket.readyState === 1 && websocket.send('tasks');
		updateTasks();
	}, []); // Only on first render, not updates

	React.useEffect(() => { // Everytime the tasks array is changed
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = false;
			deref.collectors = sortCollectors({
				column: prev.column,
				direction: prev.direction,
				collectors: tasks.map((task) => {
					//console.debug('task', task);
					const {
						progress: {
							current,
							info,
							total
						},
						//startTime,
						state
					} = task;
					try {
						const {
							name: collection,
							currentTime,
							startTime = currentTime,
							message
						} = JSON.parse(info);
						/*console.debug({
							collection,
							current,
							currentTime,
							message,
							startTime,
							state,
							total
						});*/
						const remainingCount = total - current;
						//console.debug({remainingCount});

						const percent = Math.floor(current / total * 10000)/100; // Keeping two decimals
						//console.debug({percent});

						const durationMs = currentTime - startTime;
						//console.debug({durationMs});

						const averageMs = current ? durationMs / current : durationMs;
						//console.debug({averageMs});

						const remainingMs = (remainingCount * averageMs);
						//console.debug({remainingMs});

						const etaMs = currentTime + remainingMs;
						//console.debug({etaMs});

						return {
							averageMs,
							collection,
							current,
							currentTime,
							durationMs,
							etaMs,
							message,
							percent,
							remainingCount,
							remainingMs,
							startTime,
							state,
							total
						};
					} catch (e) {
						// no-op
					} // try...catch
					return null;
				}).filter(x => x) // map tasks
			}); // sortCollectors
			return deref;
		}); // setState
	}, [tasks]); // Everytime the tasks array is changed

	const {
		collectors,
		column,
		direction//,
		//isLoading
	} = state;

	useInterval(() => {
		//websocket && websocket.readyState === 1 && websocket.send('tasks');
		updateTasks();
	}, delay);

	const sortGen = (c :string) => () => {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev)) as StatusComponentState;
			if(c === prev.column) {
				deref.direction = prev.direction === DIRECTION_ASCENDING ? DIRECTION_DESCENDING : DIRECTION_ASCENDING;
			} else {
				deref.column = c;
			}
			deref.collectors = sortCollectors({
				collectors: prev.collectors,
				column: deref.column,
				direction: deref.direction
			});
			return deref;
		});
	}; // sortGen

	return <>
		<Header as='h1' content='Status'/>
		<Table celled compact selectable sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell
						onClick={sortGen('collection')}
						sorted={column === 'collection' ? direction : null}
					>Collection</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('state')}
						sorted={column === 'state' ? direction : null}
					>State</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('current')}
						sorted={column === 'current' ? direction : null}
					>Current</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('remainingCount')}
						sorted={column === 'remainingCount' ? direction : null}
					>Remaining</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('total')}
						sorted={column === 'total' ? direction : null}
					>Total</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('percent')}
						sorted={column === 'percent' ? direction : null}
					>Percent</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('startTime')}
						sorted={column === 'startTime' ? direction : null}
					>Start time</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('durationMs')}
						sorted={column === 'durationMs' ? direction : null}
					>Duration</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('averageMs')}
						sorted={column === 'averageMs' ? direction : null}
					>Average</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('remainingMs')}
						sorted={column === 'remainingMs' ? direction : null}
					>Time left</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('etaMs')}
						sorted={column === 'etaMs' ? direction : null}
					>Eta</Table.HeaderCell>

					<Table.HeaderCell
						onClick={sortGen('currentTime')}
						sorted={column === 'currentTime' ? direction : null}
					>End time</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{collectors.map(({
					averageMs,
					collection,
					current,
					currentTime,
					durationMs,
					etaMs,
					message,
					percent,
					remainingCount,
					remainingMs,
					startTime,
					state,
					total
				}, index) => {
					moment.locale('nb'); // TODO use locale from backend?
					return <React.Fragment key={index}>
						<Table.Row>
							<Table.Cell>{collection}</Table.Cell>
							<Table.Cell>{state}</Table.Cell>

							<Table.Cell>{current}</Table.Cell>
							<Table.Cell>{remainingCount}</Table.Cell>
							<Table.Cell>{total}</Table.Cell>
							<Table.Cell>{percent}</Table.Cell>

							<Table.Cell>{moment(new Date(startTime)).format(FORMAT)}</Table.Cell>
							<Table.Cell>{prettyMs(durationMs, {
								//formatSubMilliseconds: true,
								separateMilliseconds: true
							})}</Table.Cell>

							<Table.Cell>{prettyMs(averageMs, {
								//formatSubMilliseconds: true,
								separateMilliseconds: true
							})}</Table.Cell>
							<Table.Cell>{state === TASK_STATE_RUNNING ? prettyMs(remainingMs, {
								//formatSubMilliseconds: true,
								separateMilliseconds: true
							}) : null}</Table.Cell>
							<Table.Cell>{state === TASK_STATE_RUNNING ? moment(new Date(etaMs)).format(FORMAT) : null}</Table.Cell>
							{/* End time */}
							<Table.Cell>{state === TASK_STATE_RUNNING ? '' : moment(new Date(currentTime)).format(FORMAT)}</Table.Cell>

							{/*<Table.Cell>{message}</Table.Cell>*/}
						</Table.Row>
						<Table.Row>
							<Table.Cell colSpan='12'><div
								className={classNames(
									'ui',
									'progress',
									taskStateToProgressClassName(state)
								)}
								data-percent={percent}
								data-total={total}
								data-value={current}
							>
								<div className="bar" style={{
									width: `${percent}%`
								}}>
									<div className="progress">{percent}%</div>
								</div>
								<div className="label">{message}</div>
							</div></Table.Cell>
						</Table.Row>
					</React.Fragment>;})}
			</Table.Body>
		</Table>
		<Form>
			<Form.Field>Update every</Form.Field>
			<Form.Field>
				<Dropdown
					fluid
					selection
					onChange={(
						//@ts-ignore
						event,
						{value}
					) => setDelay(value as number)}
					options={[{
						key: 1000,
						text: 'second',
						value: 1000
					},{
						key: 2500,
						text: '2,5 seconds',
						value: 2500
					},{
						key: 5000,
						text: '5 seconds',
						value: 5000
					},{
						key: 10000,
						text: '10 seconds',
						value: 10000
					}]}
					value={delay}
				/>
			</Form.Field>
		</Form>
	</>;
} // function Status
