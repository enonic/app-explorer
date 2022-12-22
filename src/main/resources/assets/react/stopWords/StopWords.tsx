import {
	Button,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import Flex from '../components/Flex';
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
	return <Flex
		justifyContent='center'>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-ma-widescreenExceptGutters-widescreenUp',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='hidden'
		>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
					<Segment className='button'>
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
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<Button
						basic
						color='blue'
						loading={isLoading}
						onClick={memoizedUpdateStopWords}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Flex.Item>
			</Flex>
			<Header
				as='h1'
				content='Stop words'
				disabled={isLoading}
			/>
			<Table celled compact striped>
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
							<Table.Cell>
								{words.map((word,i) => <span key={i}>{i > 0 && ', '}{word}</span>)}
								{/*<ul style={{
									listStyleType: 'none',
									margin: 0,
									padding: 0
								}}>
									{words.map((word, i) => <li key={i} style={{marginBottom: 3}}>{word}</li>)}
								</ul>*/}
							</Table.Cell>
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
		</Flex.Item>
	</Flex>;
} // function StopWords
