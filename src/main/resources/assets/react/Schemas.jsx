import {
	Header,
	Table
} from 'semantic-ui-react';

import {NewOrEditSchemaModal} from './schemas/NewOrEditSchemaModal';


const QUERY_SCHEMAS_GQL = `{
  querySchemas {
    hits {
      _id
      _name
    }
  }
}`;


export function Schemas({
	servicesBaseUrl
}) {
	const [schemas, setSchemas] = React.useState([]);

	function fetchSchemas() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: QUERY_SCHEMAS_GQL
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setSchemas(data.data.querySchemas.hits);
			});
	} // fetchSchemas

	React.useEffect(() => {
		fetchSchemas();
	}, []);

	console.debug('schemas', schemas);

	return <>
		<Header as='h1' content='Schemas'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{schemas.map(({
					_id,
					_name
				}, index) => {
					return <Table.Row key={index}>
						<Table.Cell collapsing><NewOrEditSchemaModal
							_id={_id}
							servicesBaseUrl={servicesBaseUrl}
						/></Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditSchemaModal
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // Schemas
