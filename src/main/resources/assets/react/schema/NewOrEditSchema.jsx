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

import {Button, Form, Header, Popup, Table} from 'semantic-ui-react';


import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';

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

const CREATE_SCHEMA_GQL = `mutation CreateSchemaMutation(
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
      max
      min
      name
      valueType
    }
  }
}`;


export function NewOrEditSchema({
	doClose,
	//_id,
	initialValues = {
		_name: '',
		properties: []
	},
	servicesBaseUrl
}) {
	return <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			console.debug('submit values', values);
			const {_name, properties} = values;
			console.debug('submit _name', _name);

			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify({
					query: CREATE_SCHEMA_GQL,
					variables: {
						_name,
						properties
					}
				})
			}).then(response => {
				if (response.status === 200) { doClose(); }
			});
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
								value={{
									max: 0,
									min: 0,
									name: '',
									valueType: VALUE_TYPE_STRING
								}}
							/>}
						/>;
					}
					return <>
						<Table celled collapsing compact selectable singleLine striped>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Name</Table.HeaderCell>
									<Table.HeaderCell>Value type</Table.HeaderCell>
									<Table.HeaderCell>Min</Table.HeaderCell>
									<Table.HeaderCell>Max</Table.HeaderCell>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{propertiesArray.map(({
									max, min, name//, valueType
								}, index) => {
									const PATH_PROPERTY = `${PATH_PROPERTIES}.${index}`;
									return <Table.Row key={PATH_PROPERTY}>
										<Table.Cell collapsing>
											<Input
												fluid
												name='name'
												parentPath={PATH_PROPERTY}
												placeholder='Please input a name'
												value={name}
											/>
										</Table.Cell>
										<Table.Cell collapsing>
											<Dropdown
												options={OPTIONS_VALUE_TYPES}
												name='valueType'
												parentPath={PATH_PROPERTY}
												placeholder='Please select one or more collections...'
												selection
											/>
										</Table.Cell>
										<Table.Cell collapsing>
											<Input
												fluid
												name='min'
												parentPath={PATH_PROPERTY}
												type='number'
												value={min}
											/>
										</Table.Cell>
										<Table.Cell collapsing>
											<Input
												fluid
												name='max'
												parentPath={PATH_PROPERTY}
												type='number'
												value={max}
											/>
										</Table.Cell>
										<Table.Cell collapsing>
											<Button.Group>
												<Popup
													content='Insert property'
													inverted
													trigger={<InsertButton
														path={PATH_PROPERTIES}
														index={index}
														value={{
															max: 0,
															min: 0,
															name: '',
															valueType: VALUE_TYPE_STRING
														}}
													/>}
												/>
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
							<Table.Footer>
								<Table.Row>
									<Table.Cell collapsing></Table.Cell>
									<Table.Cell collapsing></Table.Cell>
									<Table.Cell collapsing></Table.Cell>
									<Table.Cell collapsing></Table.Cell>
									<Table.Cell collapsing>
										<Popup
											content='Add property'
											inverted
											trigger={<InsertButton
												path={PATH_PROPERTIES}
												index={propertiesArray.length}
												value={{
													max: 0,
													min: 0,
													name: '',
													valueType: VALUE_TYPE_STRING
												}}
											/>}
										/>
									</Table.Cell>
								</Table.Row>
							</Table.Footer>
						</Table>
					</>;
				}}
			/>
		</Form>
		<Form.Field>
			<SubmitButton/>
			<ResetButton/>
		</Form.Field>
	</EnonicForm>;
} // NewOrEditSchema
