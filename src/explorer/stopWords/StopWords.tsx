import {
	Header,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import RefreshButton from '../components/buttons/RefreshButton';
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
		memoizedUpdateStopWords,
		queryStopWords,
		setShowAll,
		showAll
	} = useStopWordsState({
		servicesBaseUrl
	});
	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
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
					<Segment className='button-padding'>
						<Radio
							label={"Show all fields"}
							checked={showAll}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setShowAll(checked);
							}}
							toggle
						/>
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<RefreshButton
						loading={isLoading}
						onClick={memoizedUpdateStopWords}
					/>
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
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Count</Table.HeaderCell>
						{showAll ?<Table.HeaderCell>Words</Table.HeaderCell> : null}
						<Table.HeaderCell textAlign='center'>{showAll ? 'Actions' : 'Edit'}</Table.HeaderCell>
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
							<Table.Cell>{_name}</Table.Cell>
							<Table.Cell collapsing textAlign='right'>{words.length}</Table.Cell>
							{
								showAll
									? <Table.Cell>
										{words.map((word,i) => <span key={i}>{i > 0 && ', '}{word}</span>)}
										{/*<ul style={{
											listStyleType: 'none',
											margin: 0,
											padding: 0
										}}>
											{words.map((word, i) => <li key={i} style={{marginBottom: 3}}>{word}</li>)}
										</ul>*/}
									</Table.Cell>
									: null
							}
							<Table.Cell collapsing textAlign='center'>
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
								{
									showAll
										? <DeleteModal
											_id={_id}
											_name={_name}
											afterClose={memoizedUpdateStopWords}
											disabled={isLoading}
											loading={isLoading}
											servicesBaseUrl={servicesBaseUrl}
										/>
										: null
								}
							</Table.Cell>
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
