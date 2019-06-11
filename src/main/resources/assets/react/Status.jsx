import classNames from 'classnames';
import moment from 'moment';
import prettyMs from 'pretty-ms';
import React from 'react';
import {Table} from './elements/Table';
import {toStr} from './utils/toStr';


const FORMAT = 'YYYY-MM-DD hh:mm:ss';


function taskStateToProgressClassName(state) {
	switch (state) {
	case 'RUNNING': return 'active';
	case 'FINISHED': return 'success';
	case 'WAITING': return 'warning';
	//case 'FAILED': return 'error';
	default: return 'error';
	}
}


export class Status extends React.Component {
	constructor(props) {
    	super(props);

    	this.state = {
      		collectors: [],
			isLoading: false
    	};
  	}


	componentDidMount() {
		const {serviceUrl} = this.props;

		this.interval = setInterval(() => {
			this.setState({ isLoading: true });
			fetch(serviceUrl)
	      		.then(response => {
					//console.debug(response);
					return response.json()
				})
	      		.then(data => {
					//console.debug(data);
					return this.setState({
						collectors: data,
						isLoading: false
					});
				});
		}, 1000);
  	}


	componentWillUnmount() {
	  clearInterval(this.interval);
	}


	render() {
		/*console.debug(toStr({
			component: 'Status',
			props: this.props,
			state: this.state
		}));*/
		const {collectors} = this.state;
		return <>
		<Table className='sortable' headers={[
			'Collection',
			'State',

			'Current',
			'Remaining',
			'Total',
			'Percent',

			'Start time',
			'Duration',

			'Average',
			'Time left',
			'Eta',
			'End time'//,

			//'Progress',
			//'Message'
		]}>
			{collectors.map(({
				progress: {
					current,
					info: {
						name,
						currentTime,
						startTime = currentTime,
						message
					},
					total
				},
				//startTime,
				state
			}, index) => {
				/*console.debug(toStr({
					component: 'Status',
					name,
					state,
					current,
					total,
					currentTime,
					startTime
				}));*/
				const remainingCount = total - current;
				const percent = Math.floor(current / total * 10000)/100; // Keeping two decimals

				const durationMs = currentTime - startTime;
				const averageMs = durationMs / current;
				const remainingMs = (remainingCount * averageMs)
				const etaMs = currentTime + remainingMs;
				/*console.debug(toStr({
					component: 'Status',
					percent,
					durationMs,
					averageMs,
					remainingCount,
					remainingMs,
					etaMs
				}));*/
				moment.locale('nb'); // TODO use locale from backend?
				return <React.Fragment key={index}>
					<tr>
						<td>{name}</td>
						<td>{state}</td>

						<td data-sort-value={current}>{current}</td>
						<td data-sort-value={remainingCount}>{remainingCount}</td>
						<td data-sort-value={total}>{total}</td>
						<td data-sort-value={percent}>{percent}</td>

						<td data-sort-value={startTime}>{moment(new Date(startTime)).format(FORMAT)}</td>
						<td data-sort-value={durationMs}>{prettyMs(durationMs, {
							//formatSubMs: true,
							separateMs: true
						})}</td>

						<td data-sort-value={averageMs}>{prettyMs(averageMs, {
							//formatSubMs: true,
							separateMs: true
						})}</td>
						<td data-sort-value={remainingMs}>{state === 'RUNNING' ? prettyMs(remainingMs, {
							//formatSubMs: true,
							separateMs: true
						}) : null}</td>
						<td data-sort-value={etaMs}>{state === 'RUNNING' ? moment(new Date(etaMs)).format(FORMAT) : null}</td>
						{/* End time */}
						<td data-sort-value={currentTime}>{state === 'RUNNING' ? '' : moment(new Date(currentTime)).format(FORMAT)}</td>

						{/*<td>{message}</td>*/}
					</tr>
					<tr>
						<td colSpan='12' data-sort-value={percent}><div
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
						</div></td>
					</tr>
				</React.Fragment>;})}
		</Table>
		</>;
	}
} // class Status
