import prettyMs from 'pretty-ms';
import {
	Button,
	Checkbox,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Grid,
	Header,
	Icon,
	Loader,
	Pagination,
	Segment,
	Table
} from 'semantic-ui-react';
import {useJournalsState} from './useJournalsState';


export function Journals({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const {
		aggregations,
		column,
		columns,
		direction,
		durationSinceLastUpdate,
		end,
		handleCheckboxChange,
		handleInputChange,
		handlePaginationChange,
		handleSort,
		hits,
		loading,
		memoizedSearchJournals,
		page,
		params,
		start,
		total,
		totalPages
	} = useJournalsState({
		servicesBaseUrl
	});
	return <>
		<Segment className='page' basic>
			<Grid>
				<Grid.Row reversed='mobile'>
					<Grid.Column mobile={16} tablet={8} computer={8}>
						<Header
							as='h1'
							content='Journal'
							disabled={loading}
						/>
						<Divider hidden/>
					</Grid.Column>
					<Grid.Column mobile={16} tablet={8} computer={8}>
						<Button
							basic
							floated='right'
							color='blue'
							loading={loading}
							onClick={memoizedSearchJournals}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					<Grid.Column width={16}>
						<Dimmer.Dimmable dimmed={loading}>
          					<Dimmer active={loading} inverted>
            					<Loader>Loading</Loader>
          					</Dimmer>
							<>
								<Table celled compact selectable sortable striped attached='top'>
									<Table.Header>
										<Table.Row className={loading ? 'disabled' : ''}>
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
										{hits.map(({collection, startTime, endTime, duration, errorCount, successCount}, i) => <Table.Row disabled={loading} key={i}>
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
								<p className={loading ? 'disabled' : ''}>Displaying {start}-{end} of {total}</p>
							</>
						</Dimmer.Dimmable>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					<Grid.Column mobile={16} tablet={8} computer={4}>
						{/*<Header
							as='h2'
							content='Filters'
						/>*/}
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
							</Form>
						</Segment>
						<Divider hidden/>
					</Grid.Column>
					<Grid.Column mobile={16} tablet={8} computer={4}>
						<Segment>
							<Form>
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
							</Form>
						</Segment>
						<Divider hidden/>
					</Grid.Column>
					<Grid.Column mobile={16} tablet={8} computer={4}>
						<Segment>
							<Form>
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
						<Divider hidden/>
					</Grid.Column>
					<Grid.Column mobile={16} tablet={8} computer={4}>
						{/*<Header
							as='h2'
							content='Options'
						/>*/}
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
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</Segment>
	</>;
} // function Journals
