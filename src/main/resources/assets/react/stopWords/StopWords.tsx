import type {
	FetchQueryStopWordsData,
	QueryStopWordsResult
} from '../../../services/graphQL/fetchers/fetchQueryStopWords';


import * as React from 'react';
import {Button, Header, Radio, Segment, Table} from 'semantic-ui-react';

import {DeleteModal} from './DeleteModal';
import {NewOrEditModal} from './NewOrEditModal';
import {fetchQueryStopWords} from '../../../services/graphQL/fetchers/fetchQueryStopWords';


export function StopWords(props :{
	servicesBaseUrl :string
}) {
	const {
		servicesBaseUrl
	} = props;

	const [showDelete, setShowDelete] = React.useState(false);
	const [state, setState] = React.useState({
		queryStopWords: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: false
	} as {
		isLoading :boolean
		queryStopWords :QueryStopWordsResult
	});

	function updateStopwords() {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = true;
			return deref;
		});
		fetchQueryStopWords({
			handleData: (data :FetchQueryStopWordsData) => setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				deref.queryStopWords = data.queryStopWords;
				deref.isLoading = false;
				return deref;
			}),
			url: `${servicesBaseUrl}/graphQL`
		});
	} // updateStopwords

	React.useEffect(() => updateStopwords(), []);

	const {queryStopWords} = state;

	return <>
		<Segment basic style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show delete"}
								checked={showDelete}
								onChange={(
									//@ts-ignore
									ignored,
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
		</Segment>
		<Header as='h1' content='Stop words'/>
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
				}, index) => {
					const key = `list[${index}]`;
					return <Table.Row key={key}>
						<Table.Cell collapsing>
							<NewOrEditModal
								_id={_id}
								_name={_name}
								afterClose={() => updateStopwords()}
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
										afterClose={updateStopwords}
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
			afterClose={updateStopwords}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // function StopWords
