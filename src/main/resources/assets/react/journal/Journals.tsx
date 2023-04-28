import type { BucketsAggregationResult } from '/lib/xp/node';

import ms from 'ms';
import {
	Button,
	Checkbox,
	Dimmer,
	Dropdown,
	Form,
	Header,
	Icon,
	Loader,
	Pagination,
	Popup,
	Table,
} from 'semantic-ui-react';
import RefreshButton from '../components/buttons/RefreshButton';
import Flex from '../components/Flex';
import {useJournalsState} from './useJournalsState';


export function Journals({
	servicesBaseUrl
}: {
	servicesBaseUrl: string
}) {
	const {
		aggregations,
		collectionsPopupOpen, setCollectionsPopupOpen,
		column,
		columns,
		columnsPopupOpen, setColumnsPopupOpen,
		direction,
		end,
		errorsPopupOpen, setErrorsPopupOpen,
		handleCheckboxChange,
		handleInputChange,
		handlePaginationChange,
		handleSort,
		hits,
		loading,
		memoizedSearchJournals,
		page,
		params,
		perPagePopupOpen, setPerPagePopupOpen,
		start,
		total,
		totalPages
	} = useJournalsState({
		servicesBaseUrl
	});
	return <Flex
		className='mt-1rem'
		justifyContent='center'>
		<Flex.Item
			className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown'
			overflowX='overlay'
			overflowY='visible'
		>
			<Flex justifyContent='space-between'>
				<Flex.Item>
					<Popup
						content={<Dropdown
							defaultValue={params.collections}
							multiple={true}
							name='collections'
							onChange={handleInputChange}
							options={(aggregations.collection as BucketsAggregationResult).buckets.map(({key, docCount}) => ({key, text: `${key} (${docCount})`, value: key}))}
							search
							selection
							style={{marginTop:6}}
						/>}
						flowing
						header='Collections'
						hoverable
						inverted
						on='hover'
						onClose={() => {setCollectionsPopupOpen(false)}}
						onOpen={() => {setCollectionsPopupOpen(true)}}
						open={collectionsPopupOpen}
						trigger={<Button
							basic={!collectionsPopupOpen}
							circular
							color='black'
							icon='database'
							size='medium'
						/>}
					/>
					<Popup
						content={<Dropdown
							defaultValue={params.perPage}
							name='perPage'
							onChange={handleInputChange}
							options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
							selection
							style={{marginTop:6}}
						/>}
						flowing
						header='Per page'
						hoverable
						inverted
						on='hover'
						onClose={() => {setPerPagePopupOpen(false)}}
						onOpen={() => {setPerPagePopupOpen(true)}}
						open={perPagePopupOpen}
						trigger={<Button
							basic={!perPagePopupOpen}
							circular
							color='black'
							icon='resize vertical'
							size='medium'
						/>}
					/>
					<Popup
						content={<Checkbox
							checked={params.showWithoutErrors}
							label='Show journals without errors'
							name='showWithoutErrors'
							onChange={handleCheckboxChange}
							toggle
							style={{marginTop:6}}
						/>}
						flowing
						header='Errors'
						hoverable
						inverted
						on='hover'
						onClose={() => {setErrorsPopupOpen(false)}}
						onOpen={() => {setErrorsPopupOpen(true)}}
						open={errorsPopupOpen}
						trigger={<Button
							basic={!errorsPopupOpen}
							circular
							color='black'
							icon='filter'
							size='medium'
						/>}
					/>
					<Popup
						content={<Form style={{marginTop:6}}>
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
						</Form>}
						flowing
						header='Columns'
						hoverable
						inverted
						on='hover'
						onClose={() => {setColumnsPopupOpen(false)}}
						onOpen={() => {setColumnsPopupOpen(true)}}
						open={columnsPopupOpen}
						trigger={<Button
							basic={!columnsPopupOpen}
							circular
							color='black'
							icon='columns'
							size='medium'
						/>}
					/>
				</Flex.Item>
				<Flex.Item>
					<RefreshButton
						loading={loading}
						onClick={memoizedSearchJournals}
					/>
				</Flex.Item>
			</Flex>
			<Header
				as='h1'
				content='Journal'
				disabled={loading}
			/>
			<Dimmer.Dimmable dimmed={loading}>
				<Dimmer active={loading} inverted>
					<Loader>Loading</Loader>
				</Dimmer>
				<>
					<Table celled compact sortable striped>
						<Table.Header>
							<Table.Row className={loading ? 'disabled' : ''}>
								{columns.name ? <Table.HeaderCell
									collapsing
									name='name'
									onClick={handleSort}
									sorted={column === 'name' ? direction : null}
								>Collection</Table.HeaderCell> : null}
								{columns.startTime ? <Table.HeaderCell
									collapsing
									name='startTime'
									onClick={handleSort}
									sorted={column === 'startTime' ? direction : null}
								>Start</Table.HeaderCell> : null}
								{columns.endTime ? <Table.HeaderCell
									collapsing
									name='endTime'
									onClick={handleSort}
									sorted={column === 'endTime' ? direction : null}
								>End</Table.HeaderCell> : null}
								{columns.duration ? <Table.HeaderCell
									collapsing
									name='duration'
									onClick={handleSort}
									sorted={column === 'duration' ? direction : null}
								>Duration</Table.HeaderCell> : null}
								{columns.errorCount ? <Table.HeaderCell
									collapsing
									name='errorCount'
									onClick={handleSort}
									sorted={column === 'errorCount' ? direction : null}
								>Errors</Table.HeaderCell> : null}
								{columns.successCount ? <Table.HeaderCell
									collapsing
									name='successCount'
									onClick={handleSort}
									sorted={column === 'successCount' ? direction : null}
								>Successes</Table.HeaderCell> : null}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{hits.map(({
								collection,
								startTime,
								endTime,
								duration,
								errorCount,
								successCount
							}, i) => <Table.Row disabled={loading} key={i}>
								{columns.name ? <Table.Cell collapsing>{collection}</Table.Cell> : null}
								{columns.startTime ? <Table.Cell collapsing>{startTime}</Table.Cell> : null}
								{columns.endTime ? <Table.Cell collapsing>{endTime}</Table.Cell> : null}
								{columns.duration ? <Table.Cell collapsing>{ms(duration)}</Table.Cell> : null}
								{columns.errorCount ? <Table.Cell collapsing>{errorCount}</Table.Cell> : null}
								{columns.successCount ? <Table.Cell collapsing>{successCount}</Table.Cell> : null}
							</Table.Row>)}
						</Table.Body>
					</Table>
					<Pagination
						pointing
						secondary
						size='mini'
						style={{
							marginBottom: 14,
							marginTop: 14
						}}

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
		</Flex.Item>
	</Flex>;
} // function Journals
