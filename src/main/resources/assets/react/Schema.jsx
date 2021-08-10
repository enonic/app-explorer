import {
	Header,
	Table
} from 'semantic-ui-react';

import {NewOrEditSchemaModal} from './schema/NewOrEditSchemaModal';


const QUERY_Schema_GQL = `{
  querySchema {
    hits {
      _id
      _name
	  properties {
        max
        min
        name
        valueType
      }
    }
  }
}`;


export function Schema({
	servicesBaseUrl
}) {
	const [schema, setSchema] = React.useState([]);

	function fetchSchema() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: QUERY_Schema_GQL
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setSchema(data.data.querySchema.hits);
			});
	} // fetchSchema

	React.useEffect(() => {
		fetchSchema();
	}, []);

	console.debug('schema', schema);

	return <>
		<Header as='h1' content='Schema'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{schema.map(({
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
} // Schema
