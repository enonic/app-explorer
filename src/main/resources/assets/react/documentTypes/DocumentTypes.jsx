import {
	Button,
	Header,
	Icon,
	Table
} from 'semantic-ui-react';

import {NewOrEditDocumentTypeModal} from './NewOrEditDocumentTypeModal';
import {DeleteDocumentTypeModal} from './DeleteDocumentTypeModal';
import {useInterval} from '../utils/useInterval';
import {GQL_QUERY_QUERY_DOCUMENT_TYPES} from '../../../services/graphQL/documentType/queryQueryDocumentTypes';


export function DocumentTypes({
	servicesBaseUrl
}) {
	const [boolPoll, setBoolPoll] = React.useState(true);
	const [documentTypes, setDocumentTypes] = React.useState([]);

	function queryDocumentTypes() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_QUERY_QUERY_DOCUMENT_TYPES
			})
		})
			.then(response => response.json())
			.then(json => {
				//console.debug('json', json);
				setDocumentTypes(json.data.queryDocumentTypes.hits);
			});
	} // queryDocumentTypes

	React.useEffect(() => {
		queryDocumentTypes();
	}, []);

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			queryDocumentTypes();
		}
	}, 2500);

	//console.debug('documentTypes', documentTypes);

	return <>
		<Header as='h1' content='Document types'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Property count</Table.HeaderCell>
					<Table.HeaderCell>Properties</Table.HeaderCell>
					<Table.HeaderCell>Properties</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{documentTypes.map(({
					_id,
					_name,
					properties = []
				}, index) => {
					return <Table.Row key={index}>
						<Table.Cell collapsing><NewOrEditDocumentTypeModal
							_id={_id}
							_name={_name}
							afterClose={() => {
								queryDocumentTypes();
								setBoolPoll(true);
							}}
							onOpen={() => {
								setBoolPoll(false);
							}}
							servicesBaseUrl={servicesBaseUrl}
						/></Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						<Table.Cell collapsing>{properties.length}</Table.Cell>
						<Table.Cell collapsing>{properties.map(({name})=>name).join(', ')}</Table.Cell>
						<Table.Cell collapsing>
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Name</Table.HeaderCell>
										<Table.HeaderCell>Min</Table.HeaderCell>
										<Table.HeaderCell>Max</Table.HeaderCell>
										<Table.HeaderCell>Indexing</Table.HeaderCell>
										<Table.HeaderCell>Value type</Table.HeaderCell>
										<Table.HeaderCell>Fulltext</Table.HeaderCell>
										<Table.HeaderCell>nGram</Table.HeaderCell>
										<Table.HeaderCell>Include in _allText</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{properties.map(({
										enabled,
										fulltext,
										includeInAllText,
										max,
										min,
										name,
										ngram,
										valueType
									}, j) => <Table.Row key={`${index}.${j}`}>
										<Table.Cell collapsing>{name}</Table.Cell>
										<Table.Cell collapsing>{min}</Table.Cell>
										<Table.Cell collapsing>{max}</Table.Cell>
										<Table.Cell collapsing>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell collapsing>{valueType}</Table.Cell>
										<Table.Cell collapsing>{fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell collapsing>{ngram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell collapsing>{includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									</Table.Row>)}
								</Table.Body>
							</Table>
						</Table.Cell>
						<Table.Cell collapsing>
							<Button.Group>
								<DeleteDocumentTypeModal
									_id={_id}
									_name={_name}
									afterClose={() => {
										queryDocumentTypes();
										setBoolPoll(true);
									}}
									onOpen={() => {
										setBoolPoll(false);
									}}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditDocumentTypeModal
			afterClose={() => {
				queryDocumentTypes();
				setBoolPoll(true);
			}}
			onOpen={() => {
				setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // DocumentTypes
