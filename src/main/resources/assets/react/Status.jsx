import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import prettyMs from 'pretty-ms';
//import {toStr} from './utils/toStr';
import {Dropdown, Form, Header, Table} from 'semantic-ui-react';

const FORMAT = 'YYYY-MM-DD hh:mm:ss';


function useInterval(callback, delay) {
	const savedCallback = React.useRef();

	// Remember the latest callback.
	React.useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	React.useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
} // useInterval


function taskStateToProgressClassName(state) {
	switch (state) {
	case 'RUNNING': return 'active';
	case 'FINISHED': return 'success';
	case 'WAITING': return 'warning';
	//case 'FAILED': return 'error';
	default: return 'error';
	}
}


export function Status (props) {
	const {servicesBaseUrl} = props;

	const [delay, setDelay] = React.useState(5000);
	const [state, setState] = React.useState({
		collectors: [],
		column: 'startTime',
		direction: 'ascending',
		isLoading: false
	});

	function sortCollectors({
		collectors,
		column,
		direction
	}) {
		const sorted = _.sortBy(collectors, column);
		if(direction === 'descending') {
			return sorted.reverse();
		}
		return sorted;
	} // sortCollectors

	function getStatus() {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = true;
			return deref;
		});
		fetch(`${servicesBaseUrl}/listCollectors`)
			.then(response => {
				//console.debug(response);
				return response.json()
			})
			.then(data => {
				//console.debug(data);
				return setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.isLoading = false;
					deref.collectors = sortCollectors({
						column: prev.column,
						direction: prev.direction,
						collectors: data.map(({
							progress: {
								current,
								info: {
									name: collection,
									currentTime,
									startTime = currentTime,
									message
								},
								total
							},
							//startTime,
							state
						}) => {
							/*console.debug({
								current,
								currentTime,
								startTime,
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
						}) // collectors
					}) // sortCollectors
					return deref;
				}); // setState
			}); // fetch
	} // getStatus

	React.useEffect(() => getStatus(), []);

	const {
		collectors,
		column,
		direction,
		isLoading
	} = state;

	useInterval(() => {
    	getStatus();
  	}, delay);

	const sortGen = (c) => () => {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			if(c === prev.column) {
				deref.direction = prev.direction === 'ascending' ? 'descending' : 'ascending';
			} else {
				deref.column = c;
			}
			deref.collectors = sortCollectors({
				collectors: prev.collectors,
				column: deref.column,
				direction: deref.direction
			})
			return deref;
		})
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
								//formatSubMs: true,
								separateMs: true
							})}</Table.Cell>

							<Table.Cell>{prettyMs(averageMs, {
								//formatSubMs: true,
								separateMs: true
							})}</Table.Cell>
							<Table.Cell>{state === 'RUNNING' ? prettyMs(remainingMs, {
								//formatSubMs: true,
								separateMs: true
							}) : null}</Table.Cell>
							<Table.Cell>{state === 'RUNNING' ? moment(new Date(etaMs)).format(FORMAT) : null}</Table.Cell>
							{/* End time */}
							<Table.Cell>{state === 'RUNNING' ? '' : moment(new Date(currentTime)).format(FORMAT)}</Table.Cell>

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
					onChange={(ignored,{value}) => setDelay(value)}
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
