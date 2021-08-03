import {Button, Header, Table} from 'semantic-ui-react';

import {DeleteModal} from './stopWords/DeleteModal';
import {NewOrEditModal} from './stopWords/NewOrEditModal';


export function StopWords(props) {
	const {
		servicesBaseUrl
	} = props;

	const [state, setState] = React.useState({
		stopWordsRes: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: false
	});

	function updateStopwords() {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = true;
			return deref;
		});
		fetch(`${servicesBaseUrl}/stopWordsList`)
			.then(response => response.json())
			.then(data => setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				deref.stopWordsRes = data;
				deref.isLoading = false;
				return deref;
			}));
	} // updateStopwords

	React.useEffect(() => updateStopwords(), []);

	const {stopWordsRes} = state;

	return <>
		<Header as='h1' content='Stop words'/>
		<Table celled collapsing compact selectable singleLine sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Count</Table.HeaderCell>
					<Table.HeaderCell>Words</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{stopWordsRes.hits.map(({displayName, name, words}, index) => {
					const key = `list[${index}]`;
					return <Table.Row key={key}>
						<Table.Cell collapsing>
							<NewOrEditModal
								afterClose={() => updateStopwords()}
								displayName={displayName}
								name={name}
								servicesBaseUrl={servicesBaseUrl}
								words={words}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{displayName}</Table.Cell>
						<Table.Cell collapsing>{words.length}</Table.Cell>
						<Table.Cell collapsing>{words.join(', ')}</Table.Cell>
						<Table.Cell collapsing>
							<Button.Group>
								{/* MAYBE copy/duplicate? */}
								<DeleteModal
									afterClose={() => updateStopwords()}
									name={name}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditModal
			afterClose={() => updateStopwords()}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // function StopWords
