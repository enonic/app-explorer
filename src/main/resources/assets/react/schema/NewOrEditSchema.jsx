import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';

import {
	Button, Dimmer, Form, Header, Loader, Popup, Segment, Table
} from 'semantic-ui-react';


import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';

import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {List} from 'semantic-ui-react-form/List';


const PATH_PROPERTIES = 'properties';

const OPTIONS_VALUE_TYPES = [
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
].map(key => ({
	key,
	text: key,
	value: key
}));

const GQL_SCHEMA_CREATE = `mutation CreateSchemaMutation(
	$_name: String!,
	$properties: [InputSchemaProperties]
) {
	createSchema(
		_name: $_name
		properties: $properties
	) {
		_id
		_name
		_path
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
}`;

const GQL_SCHEMA_GET = `query GetSchemaQuery($_id: String!) {
	getSchema(_id: $_id) {
		_id
		_name
		_path
		_versionKey
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
}`;

const GQL_SCHEMA_UPDATE = `mutation UpdateSchemaMutation(
	$_id: String!,
	$_name: String!,
	$_versionKey: String!
	$properties: [InputSchemaProperties]
) {
	updateSchema(
		_id: $_id
		_name: $_name
		_versionKey: $_versionKey
		properties: $properties
	) {
		_id
		_name
		_path
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
}`;

const PROPERTY_DEFAULT = {
	enabled: true,
	fulltext: true,
	includeInAllText: true,
	max: 0,
	min: 0,
	name: '',
	ngram: true,
	valueType: VALUE_TYPE_STRING
};


export function NewOrEditSchema({
	doClose,
	_id,
	servicesBaseUrl
}) {
	const [initialValues, setInitialValues] = React.useState(false);

	function getSchema() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_SCHEMA_GET,
				variables: {
					_id
				}
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setInitialValues(data.data.getSchema);
			});
	} // fetchSchema

	React.useEffect(() => {
		if (_id) {
			getSchema();
		} else {
			setInitialValues({
				_name: '',
				properties: []
			});
		}
	}, []);

	return initialValues
		? <EnonicForm
			initialValues={initialValues}
			onSubmit={(values) => {
				//console.debug('submit values', values);
				const {_name, properties} = values;
				//console.debug('submit _name', _name);

				if (_id) {
					const {_versionKey} = initialValues;
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_SCHEMA_UPDATE,
							variables: {
								_id,
								_name,
								_versionKey,
								properties
							}
						})
					}).then(response => {
						if (response.status === 200) { doClose(); }
					});
				} else {
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_SCHEMA_CREATE,
							variables: {
								_name,
								properties
							}
						})
					}).then(response => {
						if (response.status === 200) { doClose(); }
					});
				}
			}}
		>
			<Form as='div'>
				<Form.Field>
					<Input
						fluid
						label={{basic: true, content: 'Name'}}
						path='_name'
						placeholder='Please input an unique name'
					/>
				</Form.Field>
				<Header as='h2'>Properties</Header>
				<Form.Field>
					<List
						path={PATH_PROPERTIES}
						render={(propertiesArray) => {
							if(!propertiesArray.length) {
								return <Popup
									content='Add property'
									inverted
									trigger={<InsertButton
										path={PATH_PROPERTIES}
										index={0}
										value={PROPERTY_DEFAULT}
									/>}
								/>;
							}
							return <>
								<Table celled compact selectable singleLine striped>
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
											<Table.HeaderCell>Actions</Table.HeaderCell>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{propertiesArray.map(({
											enabled,
											max,
											min,
											name/*,
											valueType*/
										}, index) => {
											const PATH_PROPERTY = `${PATH_PROPERTIES}.${index}`;
											return <Table.Row key={PATH_PROPERTY}>
												<Table.Cell>
													<Input
														fluid
														name='name'
														parentPath={PATH_PROPERTY}
														placeholder='Please input a name'
														value={name}
													/>
												</Table.Cell>
												<Table.Cell>
													<Input
														fluid
														name='min'
														parentPath={PATH_PROPERTY}
														type='number'
														value={min}
													/>
												</Table.Cell>
												<Table.Cell>
													<Input
														fluid
														name='max'
														parentPath={PATH_PROPERTY}
														type='number'
														value={max}
													/>
												</Table.Cell>
												<Table.Cell collapsing>
													<Checkbox
														name='enabled'
														parentPath={PATH_PROPERTY}
														toggle
													/>
												</Table.Cell>
												<Table.Cell collapsing>
													{enabled ? <Dropdown
														disabled={!enabled}
														options={OPTIONS_VALUE_TYPES}
														name='valueType'
														parentPath={PATH_PROPERTY}
														selection
													/> : null}
												</Table.Cell>
												<Table.Cell collapsing>
													{enabled ? <Checkbox
														disabled={!enabled}
														name='fulltext'
														parentPath={PATH_PROPERTY}
														toggle
													/> : null}
												</Table.Cell>
												<Table.Cell collapsing>
													{enabled ? <Checkbox
														disabled={!enabled}
														name='ngram'
														parentPath={PATH_PROPERTY}
														toggle
													/> : null}
												</Table.Cell>
												<Table.Cell collapsing>
													{enabled ? <Checkbox
														disabled={!enabled}
														name='includeInAllText'
														parentPath={PATH_PROPERTY}
														toggle
													/> : null}
												</Table.Cell>
												<Table.Cell collapsing>
													<Button.Group>
														<Popup
															content='Add property'
															inverted
															trigger={<InsertButton
																path={PATH_PROPERTIES}
																index={index+1}
																value={PROPERTY_DEFAULT}
															/>}
														/>
														<Popup
															content='Move down'
															inverted
															trigger={<MoveDownButton
																disabled={index + 1 >= propertiesArray.length}
																path={PATH_PROPERTIES}
																index={index}
															/>}/>
														<Popup
															content='Move up'
															inverted
															trigger={<MoveUpButton
																path={PATH_PROPERTIES}
																index={index}
															/>}/>
														<Popup
															content='Delete property'
															inverted
															trigger={<DeleteItemButton
																disabled={propertiesArray.length < 2}
																path={PATH_PROPERTIES}
																index={index}
															/>}/>
													</Button.Group>
												</Table.Cell>
											</Table.Row>;
										})}
									</Table.Body>
								</Table>
							</>;
						}}
					/>
				</Form.Field>
				<Form.Field>
					<SubmitButton/>
					<ResetButton/>
				</Form.Field>
			</Form>
		</EnonicForm>
		: <Segment>
  			<Dimmer active inverted>
        		<Loader inverted>Loading</Loader>
      		</Dimmer>
    	</Segment>;
} // NewOrEditSchema
