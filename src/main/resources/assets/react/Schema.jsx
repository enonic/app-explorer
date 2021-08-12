import {
	Button,
	Header,
	Icon,
	Table
} from 'semantic-ui-react';

import {NewOrEditSchemaModal} from './schema/NewOrEditSchemaModal';
import {DeleteSchemaModal} from './schema/DeleteSchemaModal';


const GQL_SCHEMA_QUERY = `{
	querySchema {
		hits {
			_id
			_name
			properties {
				enabled
				fulltext
				includeInAllText
				max
				min
				name
				ngram
				valueType
			}
		}
	}
}`;


export function Schema({
	servicesBaseUrl
}) {
	const [schema, setSchema] = React.useState([]);

	function querySchema() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_SCHEMA_QUERY
			})
		})
			.then(response => response.json())
			.then(json => {
				//console.debug('json', json);
				setSchema(json.data.querySchema.hits);
			});
	} // querySchema

	React.useEffect(() => {
		querySchema();
	}, []);

	//console.debug('schema', schema);

	return <>
		<Header as='h1' content='Schema'/>
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
				{schema.map(({
					_id,
					_name,
					properties = []
				}, index) => {
					return <Table.Row key={index}>
						<Table.Cell collapsing><NewOrEditSchemaModal
							_id={_id}
							_name={_name}
							afterClose={() => querySchema()}
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
								<DeleteSchemaModal
									_id={_id}
									_name={_name}
									afterClose={() => querySchema()}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditSchemaModal
			afterClose={() => querySchema()}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // Schema
