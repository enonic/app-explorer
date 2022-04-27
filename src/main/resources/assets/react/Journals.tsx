//import '@babel/runtime';
//import {hash as fnv} from 'fnv-plus';
import Uri from 'jsuri';
import prettyMs from 'pretty-ms';
import * as React from 'react';
import {
	Checkbox, Dimmer, Divider, Dropdown, Form, Header, Icon, Loader, Pagination,
	Segment, Table
} from 'semantic-ui-react';


export function Journals({
	servicesBaseUrl
}) {
	const [columns, setColumns] = React.useState({
		name: true,
		startTime: true,
		endTime: true,
		duration: true,
		errorCount: true,
		successCount: true
	});
	const [loading, setLoading] = React.useState(false);
	const [params, setParams] = React.useState({
		collections: [],
		//endTimeRanges: '',
		showWithoutErrors: true,
		perPage: 25,
		page: 1,
		query: '',
		sort: 'endTime DESC'
	});
	const column = params.sort.split(' ')[0];
	const direction = params.sort.split(' ')[1] === 'DESC' ? 'descending' : 'ascending';
	const [result, setResult] = React.useState({
		aggregations: {
			collection: {
				buckets: []
			}/*,
			endTime: {
				buckets: []
			},
			startTime: {
				buckets: []
			}*/
		},
		count: 0,
		page: 1,
		total: 0,
		totalPages: 0,
		hits: []
	});

	function search() {
		setLoading(true); // Make sure this happens before setResult below?
		const uri = new Uri(`${servicesBaseUrl}/journals`);
		Object.keys(params).forEach((k) => {
			const v = params[k];
			//console.debug({k, v});
			uri.replaceQueryParam(k, v);
		});
		const uriStr = uri.toString();
		fetch(uriStr).then(response => response.json())
			.then(data => {
				setResult(data.result);
				setLoading(false);
			});
	} // function search

	React.useEffect(() => {
		search();
	}, [params]); // eslint-disable-line

	function handleCheckboxChange(e, {checked, name}) {
		//console.debug({function: 'handleCheckboxChange', name, checked});
		if (name === 'showWithoutErrors') {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.showWithoutErrors = !prevParams.showWithoutErrors;
				return derefParams;
			});
		/*} else if(name.startsWith('endTimeRange')) {
			console.debug(name);
			const range = name.replace(/^endTimeRange\./, '');
			console.debug(range);
			await setState(prevState => {
				const endTimeRangesStr = prevState.params.endTimeRanges;
				const endTimeRangesObj = {};
				endTimeRangesStr.split(',').forEach(r => {
					if(r) {
						endTimeRangesObj[r] = true;
					}
				});
				if(checked) {
					endTimeRangesObj[range] = true;
				} else {
					endTimeRangesObj[range] = undefined;
				}
				prevState.params.endTimeRanges = Object.keys(endTimeRangesObj).join(',');
				console.debug({'prevState.params.endTimeRanges': prevState.params.endTimeRanges});
				return prevState;
			});
			search();*/
		} else {
			setColumns(prevColumns => {
				const derefColumns = JSON.parse(JSON.stringify(prevColumns));
				derefColumns[name] = checked;
				return derefColumns;
			});
		}
	} // function handleCheckboxChange

	function handleInputChange(e, {name, value}) {
		//console.debug({function: 'handleInputChange', name, value});
		//console.debug({name, value});
		setParams(prevParams => {
			const derefParams = JSON.parse(JSON.stringify(prevParams));
			derefParams[name] = value;
			return derefParams;
		});
	}

	function handlePaginationChange(e, {activePage}) {
		//console.debug({function: 'handlePaginationChange', activePage});
		setParams(prevParams => {
			const derefParams = JSON.parse(JSON.stringify(prevParams));
			derefParams.page = activePage;
			return derefParams;
		});
	}

	function handleSort(syntheticEvent) {
		//console.debug({function: 'handleSort'});
		const {target} = syntheticEvent;
		//console.debug({target});

	    //const {column, direction} = state.sort;
		//console.debug({column, direction});

		const clickedColumn = target.getAttribute('name');
		//console.debug({clickedColumn});

	    if (column !== clickedColumn) {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.page = 1;
				derefParams.sort = `${clickedColumn} ASC`;
				return derefParams;
			});
	    } else {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.page = 1;
				derefParams.sort = `${clickedColumn} ${direction === 'ascending' ? 'DESC' : 'ASC'}`;
				return derefParams;
			});
		}
	}

	const {
		aggregations,
		//count,
		end,
		page,
		start,
		total,
		totalPages,
		hits
	} = result;

	if (loading) {
		return <Dimmer active inverted><Loader content='Loading' size='massive' style={{display: 'table-row'}}/></Dimmer>;
	}

	return <>
		<Segment basic>
			<Header as='h1' content='Journal'/>
			{ loading
				? <Dimmer active inverted><Loader content='Loading' size='massive' style={{display: 'table-row'}}/></Dimmer>
				: <>
					<Table celled compact selectable sortable striped attached='top'>
						<Table.Header>
							<Table.Row>
								{columns.name ? <Table.HeaderCell
									name='name'
									onClick={handleSort}
									sorted={column === 'name' ? direction : null}
								>Collection</Table.HeaderCell> : null}
								{columns.startTime ? <Table.HeaderCell
									name='startTime'
									onClick={handleSort}
									sorted={column === 'startTime' ? direction : null}
								>Start</Table.HeaderCell> : null}
								{columns.endTime ? <Table.HeaderCell
									name='endTime'
									onClick={handleSort}
									sorted={column === 'endTime' ? direction : null}
								>End</Table.HeaderCell> : null}
								{columns.duration ? <Table.HeaderCell
									name='duration'
									onClick={handleSort}
									sorted={column === 'duration' ? direction : null}
								>Duration</Table.HeaderCell> : null}
								{columns.errorCount ? <Table.HeaderCell
									name='errorCount'
									onClick={handleSort}
									sorted={column === 'errorCount' ? direction : null}
								>Errors</Table.HeaderCell> : null}
								{columns.successCount ? <Table.HeaderCell
									name='successCount'
									onClick={handleSort}
									sorted={column === 'successCount' ? direction : null}
								>Successes</Table.HeaderCell> : null}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{hits.map(({collection, startTime, endTime, duration, errorCount, successCount}, i) => <Table.Row key={i}>
								{columns.name ? <Table.Cell>{collection}</Table.Cell> : null}
								{columns.startTime ? <Table.Cell>{startTime}</Table.Cell> : null}
								{columns.endTime ? <Table.Cell>{endTime}</Table.Cell> : null}
								{columns.duration ? <Table.Cell>{prettyMs(duration)}</Table.Cell> : null}
								{columns.errorCount ? <Table.Cell>{errorCount}</Table.Cell> : null}
								{columns.successCount ? <Table.Cell>{successCount}</Table.Cell> : null}
							</Table.Row>)}
						</Table.Body>
					</Table>
					<Pagination
						attached='bottom'
						fluid
						size='mini'

						activePage={page}
						boundaryRange={1}
						siblingRange={1}
						totalPages={totalPages}

						ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
						firstItem={{content: <Icon name='angle double left' />, icon: true}}
						prevItem={{content: <Icon name='angle left' />, icon: true}}
						nextItem={{content: <Icon name='angle right' />, icon: true}}
						lastItem={{content: <Icon name='angle double right' />, icon: true}}

						onPageChange={handlePaginationChange}
					/>
					<p>Displaying {start}-{end} of {total}</p>
				</>
			}
			<Header as='h2' content='Filters'/>
			<Segment>
				<Form>
					<Form.Field>
						<Header as='h4'><Icon name='database'/> Collections</Header>
						<Dropdown
							defaultValue={params.collections}
							fluid
							multiple={true}
							name='collections'
							onChange={handleInputChange}
							options={aggregations.collection.buckets.map(({key, docCount}) => ({key, text: `${key} (${docCount})`, value: key}))}
							search
							selection
						/>
					</Form.Field>
					<Divider hidden/>
					<Form.Field>
						<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
						<Dropdown
							defaultValue={params.perPage}
							fluid
							name='perPage'
							onChange={handleInputChange}
							options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
							selection
						/>
					</Form.Field>
					<Divider hidden/>
					<Form.Field>
						<Header as='h4'><Icon name='filter'/> Errors</Header>
						<Checkbox
							checked={params.showWithoutErrors}
							label='Show journals without errors'
							name='showWithoutErrors'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					{/*<Divider hidden/>
					<Form.Field>
						<Header as='h4'><Icon name='filter'/> Endtime</Header>
						{aggregations.endTime.buckets.map(({docCount, from = '*', key, to = '*'}, i) => <Checkbox
							key={i}
							checked={endTimeRanges[`${from};${to}`]}
							label={to}
							name={`endTimeRange.${from};${to}`}
							onChange={handleCheckboxChange}
							toggle
						/>)}
					</Form.Field>*/}
				</Form>
			</Segment>
			<Header as='h2' content='Options'/>
			<Segment>
				<Header as='h4'><Icon name='columns'/> Columns</Header>
				<Form>
					<Form.Field>
						<Checkbox
							checked={columns.name}
							label='Collection'
							name='name'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							checked={columns.startTime}
							label='Start time'
							name='startTime'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							checked={columns.endTime}
							label='End time'
							name='endTime'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							checked={columns.duration}
							label='Duration'
							name='duration'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							checked={columns.errorCount}
							label='Errors'
							name='errorCount'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							checked={columns.successCount}
							label='Successes'
							name='successCount'
							onChange={handleCheckboxChange}
							toggle
						/>
					</Form.Field>
				</Form>
			</Segment>
		</Segment>
	</>;
} // function Journals
