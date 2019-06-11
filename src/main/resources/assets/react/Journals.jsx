//import '@babel/runtime';
//import {hash as fnv} from 'fnv-plus';
import Uri from 'jsuri';
import {
	Checkbox, Dimmer, Divider, Dropdown, Form, Header, Icon, Label, Loader,
	Pagination, Rail, Ref, Segment, Sticky, Table
} from 'semantic-ui-react';
import {createRef} from 'react';


/*export const hash = (object, bitlength = 128) =>
	fnv(JSON.stringify(object), bitlength).str();*/

export const hash = (object) =>
	JSON.stringify(object);


export class Journals extends React.Component {
	contextRef = createRef();

	constructor(props) {
		//console.debug({function: 'constructor', props});
    	super(props);


    	this.state = {
			cache: {},
			columns: {
				collection: true,
				startTime: false,
				endTime: true,
				duration: false,
				errorCount: true,
				successCount: true
			},
			loading: false,
			params: {
				collections: [],
				//endTimeRanges: '',
				showWithoutErrors: true,
				perPage: 25,
				page: 1,
				query: '',
				sort: 'endTime DESC'
			},
			sort: {
				column: 'endTime',
				direction: 'descending'
			},
			result: {
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
			}
    	};

		this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handlePaginationChange = this.handlePaginationChange.bind(this);
		this.handleSort = this.handleSort.bind(this);
	} // constructor


	async search() {
		//console.debug({function: 'search'});
		const {cache, params} = this.state;
		const key = hash(params);
		//await console.debug({key, cache});
		if (cache[key]) {
			this.setState({result: cache[key]});
			return;
		}

		await this.setState({loading: true});

		const {serviceUrl} = this.props;
		const uri = new Uri(serviceUrl);
		Object.entries(params).forEach(([k, v]) => {
			//console.debug({k, v});
			uri.replaceQueryParam(k, v);
		});
		const uriStr = uri.toString();
		//console.debug({uriStr});
		fetch(uriStr)
			.then(response => response.json())
			.then(data => {
				//console.debug({data});
				this.setState(prevState => {
					prevState.cache[key] = data.result;
					prevState.loading = false;
					prevState.result = data.result;
					return prevState;
				});
			})
	}


	componentDidMount() {
		//console.debug({function: 'componentDidMount'});
		this.search();
	}


	async handleCheckboxChange(e, {checked, name}) {
		//console.debug({function: 'handleCheckboxChange', name, checked});
		if (name === 'showWithoutErrors') {
			await this.setState(prevState => {
				prevState.params.showWithoutErrors = !prevState.params.showWithoutErrors;
				return prevState;
			})
			this.search();
		/*} else if(name.startsWith('endTimeRange')) {
			console.debug(name);
			const range = name.replace(/^endTimeRange\./, '');
			console.debug(range);
			await this.setState(prevState => {
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
			this.search();*/
		} else {
			await this.setState(prevState => {
				//console.debug({checked, name});
				prevState.columns[name] = checked;
				return prevState;
			});
		}
	}


  	async handleInputChange(e, {name, value}) {
		//console.debug({function: 'handleInputChange', name, value});
		//console.debug({name, value});
		await this.setState(prevState => {
			prevState.params[name] = value;
			return prevState;
		});
		this.search();
	}


	async handlePaginationChange(e, {activePage}) {
		//console.debug({function: 'handlePaginationChange', activePage});
		await this.setState(prevState => {
			prevState.params.page = activePage;
			return prevState;
		});
		this.search();
	}


	async handleSort(syntheticEvent) {
		//console.debug({function: 'handleSort'});
		const {target} = syntheticEvent;
		//console.debug({target});

	    const {column, direction} = this.state.sort;
		//console.debug({column, direction});

		const clickedColumn = target.getAttribute('name');
		//console.debug({clickedColumn});

	    if (column !== clickedColumn) {
			await this.setState(prevState => {
				prevState.sort = {
					column: clickedColumn,
					direction: 'ascending'
				};
				prevState.params.page = 1;
				prevState.params.sort = `${clickedColumn === 'collection' ? 'name' : clickedColumn} ASC`;
				return prevState;
			});
	    } else {
			await this.setState(prevState => {
				const newDirection = direction === 'ascending' ? 'descending' : 'ascending';
				prevState.sort.direction = newDirection;
				prevState.params.page = 1;
				prevState.params.sort = `${clickedColumn === 'collection' ? 'name' : clickedColumn} ${newDirection === 'ascending' ? 'ASC' : 'DESC'}`;
				return prevState;
			})
		}
		this.search();
	}


	render() {
		//console.debug({state: this.state});
		const {
			columns,
			loading,
			params,
			sort: {
				column,
				direction
			},
			result: {
				aggregations,
				count,
				end,
				page,
				start,
				total,
				totalPages,
				hits
			}
		} = this.state;
		//console.debug({count, page, total, totalPages, hits});

		/*const endTimeRanges = {}
		params.endTimeRanges.split(',').forEach(k => {
			if (k) {
				endTimeRanges[k] = true;
			}
		});
		console.debug({endTimeRanges});*/

		if (loading) {
			return <Dimmer active inverted><Loader content='Loading' size='massive' style={{display: 'table-row'}}/></Dimmer>;
		}

		return <Ref innerRef={this.contextRef}>
			<Segment basic>
				{ loading
					? <Dimmer active inverted><Loader content='Loading' size='massive' style={{display: 'table-row'}}/></Dimmer>
					: <>
						<Table celled compact selectable sortable striped attached='top'>
							<Table.Header>
		      					<Table.Row>
									{columns.collection ? <Table.HeaderCell
										name='collection'
										onClick={this.handleSort}
										sorted={column === 'collection' ? direction : null}
									>Collection</Table.HeaderCell> : null}
		        					{columns.startTime ? <Table.HeaderCell
										name='startTime'
										onClick={this.handleSort}
										sorted={column === 'startTime' ? direction : null}
									>Start</Table.HeaderCell> : null}
		        					{columns.endTime ? <Table.HeaderCell
										name='endTime'
										onClick={this.handleSort}
										sorted={column === 'endTime' ? direction : null}
									>End</Table.HeaderCell> : null}
									{columns.duration ? <Table.HeaderCell
										name='duration'
										onClick={this.handleSort}
										sorted={column === 'duration' ? direction : null}
									>Duration</Table.HeaderCell> : null}
									{columns.errorCount ? <Table.HeaderCell
										name='errorCount'
										onClick={this.handleSort}
										sorted={column === 'errorCount' ? direction : null}
									>Errors</Table.HeaderCell> : null}
									{columns.successCount ? <Table.HeaderCell
										name='successCount'
										onClick={this.handleSort}
										sorted={column === 'successCount' ? direction : null}
									>Successes</Table.HeaderCell> : null}
		      					</Table.Row>
		    				</Table.Header>
							<Table.Body>
								{hits.map(({collection, startTime, endTime, duration, errorCount, successCount}, i) => <Table.Row key={i}>
		        					{columns.collection ? <Table.Cell>{collection}</Table.Cell> : null}
									{columns.startTime ? <Table.Cell>{startTime}</Table.Cell> : null}
									{columns.endTime ? <Table.Cell>{endTime}</Table.Cell> : null}
									{columns.duration ? <Table.Cell>{duration}</Table.Cell> : null}
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

							onPageChange={this.handlePaginationChange}
						/>
						<p>Displaying {start}-{end} of {total}</p>
					</>
				}
				<Rail position='left'>
					<Sticky context={this.contextRef} offset={14}>
						<Segment basic>
							<Form>
								<Form.Field>
									<Header as='h4'><Icon name='database'/> Collections</Header>
									<Dropdown
										defaultValue={params.collections}
										fluid
										multiple={true}
										name='collections'
										onChange={this.handleInputChange}
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
										onChange={this.handleInputChange}
										options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
										selection
									/>
								</Form.Field>
								<Divider hidden/>
								<Form.Field>
									<Header as='h4'><Icon name='filter'/> Errors</Header>
									<Checkbox
										checked={this.state.params.showWithoutErrors}
										label='Show journals without errors'
										name='showWithoutErrors'
										onChange={this.handleCheckboxChange}
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
										onChange={this.handleCheckboxChange}
										toggle
									/>)}
								</Form.Field>*/}
							</Form>
						</Segment>
					</Sticky>
				</Rail>
				<Rail position='right'>
					<Sticky context={this.contextRef} offset={14}>
						<Segment basic>
							<Header as='h4'><Icon name='columns'/> Columns</Header>
							<Form>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.collection}
										label='Collection'
										name='collection'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.startTime}
										label='Start time'
										name='startTime'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.endTime}
										label='End time'
										name='endTime'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.duration}
										label='Duration'
										name='duration'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.errorCount}
										label='Errors'
										name='errorCount'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
								<Form.Field>
									<Checkbox
										checked={this.state.columns.successCount}
										label='Successes'
										name='successCount'
										onChange={this.handleCheckboxChange}
										toggle
									/>
								</Form.Field>
							</Form>
						</Segment>
					</Sticky>
				</Rail>
			</Segment>
		</Ref>;
	}
} // Journals
