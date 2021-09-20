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
	Button,
	Dimmer,
	Form,
	Header,
	Loader,
	Popup,
	Segment,
	Table
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

import {GQL_MUTATION_CREATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationCreateDocumentType';
import {GQL_MUTATION_UPDATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationUpdateDocumentType';
import {GQL_QUERY_GET_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/queryGetDocumentType';

import {fetchFields} from '../fields/fetchFields';

import {nameValidator} from '../utils/nameValidator';

const PATH_FIELDS = 'fields';
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


const FIELD_DEFAULT = {
	active: true,
	fieldId: ''
};

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


const SCHEMA = {
	_name: (v) => nameValidator(v),
	properties: (properties) => {
		//console.debug('properties', properties);
		if (!Array.isArray(properties)) {
			return 'properties must be an array';
		}
		for (var i = 0; i < properties.length; i++) { // Can't return from forEach?
			const {name} = properties[i];
			//console.debug('i', i, 'name', name);
			if(!name) {
				return {
					error: `Required!`,
					path: `properties.${i}.name`
				};
			}
			const startsWithAnythingButLowercaseLetterRegexp = /^[^a-z]/;
			const startsWithAnythingButLowercaseLetter = name.match(startsWithAnythingButLowercaseLetterRegexp);
			if (startsWithAnythingButLowercaseLetter) {
				return {
					error: `Must start with a lowercase letter. Illegal characters: ${startsWithAnythingButLowercaseLetter.join('')}`,
					path: `properties.${i}.name`
				};
			}
			const regexp =/[^a-zA-Z0-9_.]/g;
			const matches = name.match(regexp);
			//console.debug('i', i, 'name', name, 'matches', matches);
			if (matches) {
				return {
					error: `Only letters, digits, underscore and dot is allowed. Illegal characters: ${matches.join('')}`,
					path: `properties.${i}.name`
				};
			}
		} // for properties
		return undefined;
	}
}; // SCHEMA


export function NewOrEditDocumentType({
	doClose,
	_id,
	servicesBaseUrl
}) {
	const [initialValues, setInitialValues] = React.useState(false);
	const [globalFields, setGlobalFields] = React.useState([]);
	//console.debug(`NewOrEditDocumentType globalFields`, globalFields);

	const GLOBAL_FIELD_OPTIONS = globalFields.map(({_id, key}) => ({
		key: _id,
		text: key,
		value: _id
	}));

	function getDocumentType() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_QUERY_GET_DOCUMENT_TYPE,
				variables: {
					_id
				}
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setInitialValues(data.data.getDocumentType);
			});
	} // fetchDocumentType

	React.useEffect(() => {
		fetchFields({
			handleData: (data) => {
				setGlobalFields(data.queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		});
		if (_id) {
			getDocumentType();
		} else {
			setInitialValues({
				_name: '',
				addFields: true,
				fields: [],
				properties: []
			});
		}
	}, []);

	return initialValues ? <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//console.debug('submit values', values);
			const {_name, addFields, fields, properties} = values;
			//console.debug('submit _name', _name);

			const variables = {
				_name,
				addFields,
				fields,
				properties
			};
			if (_id) {
				variables._id = _id;
				variables._versionKey = initialValues._versionKey;
			}
			//console.debug('submit variables', variables);

			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify({
					query: _id ? GQL_MUTATION_UPDATE_DOCUMENT_TYPE : GQL_MUTATION_CREATE_DOCUMENT_TYPE,
					variables
				})
			}).then(response => {
				if (response.status === 200) { doClose(); }
			});
		}}
		schema={SCHEMA}
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

			<Header as='h2'>Global fields</Header>
			<Form.Field>
				<List
					path={PATH_FIELDS}
					render={(fieldsArray) => {
						//console.debug(`NewOrEditDocumentType fieldsArray`, fieldsArray);
						if(!fieldsArray.length) {
							return <Popup
								content='Add field'
								inverted
								trigger={<InsertButton
									path={PATH_FIELDS}
									index={0}
									value={FIELD_DEFAULT}
								/>}
							/>;
						}
						return <Table celled compact selectable singleLine striped>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Active</Table.HeaderCell>
									<Table.HeaderCell>Field</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>
							<Table.Body>{
								fieldsArray.map(({
									active = true//,
									//fieldId = ''
								}, index) => {
									//console.debug('NewOrEditDocumentType active', active, 'fieldId', fieldId);
									const PATH_FIELD = `${PATH_FIELDS}.${index}`;
									return <Table.Row key={index}>
										<Table.Cell><Checkbox
											name='active'
											parentPath={PATH_FIELD}
											toggle
											value={active}
										/></Table.Cell>
										<Table.Cell><Dropdown
											disabled={!active}
											options={GLOBAL_FIELD_OPTIONS}
											name='fieldId'
											parentPath={PATH_FIELD}
											selection
											placeholder='Please select a field'
										/></Table.Cell>
										<Table.Cell collapsing>
											<Button.Group>
												<Popup
													content='Add field'
													inverted
													trigger={<InsertButton
														path={PATH_FIELDS}
														index={index+1}
														value={FIELD_DEFAULT}
													/>}
												/>
												<Popup
													content='Move down'
													inverted
													trigger={<MoveDownButton
														disabled={index + 1 >= fieldsArray.length}
														path={PATH_FIELDS}
														index={index}
													/>}/>
												<Popup
													content='Move up'
													inverted
													trigger={<MoveUpButton
														path={PATH_FIELDS}
														index={index}
													/>}/>
												<Popup
													content='Delete field'
													inverted
													trigger={<DeleteItemButton
														disabled={fieldsArray.length < 2}
														path={PATH_FIELDS}
														index={index}
													/>}/>
											</Button.Group>
										</Table.Cell>
									</Table.Row>;
								}) // map
							}</Table.Body>
						</Table>;
					}}
				/>
			</Form.Field>

			<Header as='h2'>Local fields</Header>
			<Form.Field>
				<Checkbox
					label='Add new fields automatically when creating/updating documents?'
					name='addFields'
					toggle
				/>
			</Form.Field>
			<Form.Field>
				<List
					path={PATH_PROPERTIES}
					render={(propertiesArray) => {
						if(!propertiesArray.length) {
							return <Popup
								content='Add local field'
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
								<Table.Body>{
									propertiesArray.map(({
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
														content='Add local field'
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
														/>}
													/>
													<Popup
														content='Move up'
														inverted
														trigger={<MoveUpButton
															path={PATH_PROPERTIES}
															index={index}
														/>}
													/>
													<Popup
														content='Delete property'
														inverted
														trigger={<DeleteItemButton
															disabled={propertiesArray.length < 2}
															path={PATH_PROPERTIES}
															index={index}
														/>}
													/>
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
} // NewOrEditDocumentType
