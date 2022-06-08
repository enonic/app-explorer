import {
	Button,
	Grid,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {DeleteModal} from './DeleteModal';
import {NewOrEditModal} from './NewOrEditModal';
import {useStopWordsState} from './useStopWordsState';


export function StopWords({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const {
		isLoading,
		durationSinceLastUpdate,
		memoizedUpdateStopWords,
		queryStopWords,
		setShowDelete,
		showDelete
	} = useStopWordsState({
		servicesBaseUrl
	});
	return <>
		<Segment className='page' basic>
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
										label={"Show delete"}
										checked={showDelete}
										onChange={(
											//@ts-ignore
											event :unknown,
											{checked}
										) => {
											setShowDelete(checked);
										}}
										toggle
									/>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</Grid.Column>
				<Grid.Column floated='right' width={4}>
					<Button
						basic
						floated='right'
						color='blue'
						loading={isLoading}
						onClick={memoizedUpdateStopWords}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Header
			as='h1'
			content='Stop words'
			disabled={isLoading}
		/>
		<Table celled collapsing compact selectable singleLine sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Count</Table.HeaderCell>
					<Table.HeaderCell>Words</Table.HeaderCell>
					{showDelete ? <Table.HeaderCell>Delete</Table.HeaderCell> : null}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{queryStopWords.hits.map(({
					_id,
					_name,
					words
				}, index :number) => {
					const key = `list[${index}]`;
					return <Table.Row disabled={isLoading} key={key}>
						<Table.Cell collapsing>
							<NewOrEditModal
								_id={_id}
								_name={_name}
								afterClose={memoizedUpdateStopWords}
								disabled={isLoading}
								loading={isLoading}
								stopWords={queryStopWords.hits}
								servicesBaseUrl={servicesBaseUrl}
								words={words}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						<Table.Cell collapsing>{words.length}</Table.Cell>
						<Table.Cell collapsing>{words.join(', ')}</Table.Cell>
						{showDelete
							? <Table.Cell collapsing>
								<Button.Group>
									{/* MAYBE copy/duplicate? */}
									<DeleteModal
										_id={_id}
										_name={_name}
										afterClose={memoizedUpdateStopWords}
										disabled={isLoading}
										loading={isLoading}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Button.Group>
							</Table.Cell>
							: null}
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditModal
			afterClose={memoizedUpdateStopWords}
			disabled={isLoading}
			loading={isLoading}
			stopWords={queryStopWords.hits}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // function StopWords
