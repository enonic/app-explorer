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
	Icon,
	Loader,
	Modal,
	Popup,
	Segment,
	Table
} from 'semantic-ui-react';


import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';

import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Dropdown as EnonicDropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {List} from 'semantic-ui-react-form/List';

import {GQL_MUTATION_CREATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationCreateDocumentType';
import {GQL_MUTATION_UPDATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationUpdateDocumentType';
import {GQL_QUERY_GET_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/queryGetDocumentType';
import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';

import {nameValidator} from '../utils/nameValidator';

import {AddFieldModal} from './AddFieldModal';
import {RemoveFieldFromDocumentTypeModal} from './RemoveFieldFromDocumentTypeModal';


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
	active: true,
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
	doClose = () => {},
	_id, // optional
	collections = [], // optional
	interfaces = [], // optional
	servicesBaseUrl
}) {
	const [initialValues, setInitialValues] = React.useState(false);
	const [globalFields, setGlobalFields] = React.useState([]);
	const [fieldModalState, setFieldModalState] = React.useState({
		local: true,
		open: false
	});
	//console.debug(`NewOrEditDocumentType initialValues`, initialValues);
	//console.debug(`NewOrEditDocumentType globalFields`, globalFields);

	const initialFields = {};
	const initialProperties = {};
	if (initialValues) {
		if (initialValues.fields) {
			initialValues.fields.forEach(({fieldId}) => {
				initialFields[fieldId] = true;
			});
		}
		if (initialValues.properties) {
			initialValues.properties.forEach(({name}) => {
				initialProperties[name] = true;
			});
		}
	}

	const GLOBAL_FIELD_OBJ = {};
	const GLOBAL_FIELD_OPTIONS = globalFields.map(({
		_id,
		//decideByType,
		enabled,
		fieldType,
		fulltext,
		includeInAllText,
		key,
		max,
		min,
		nGram//,
		//path
	}) => {
		GLOBAL_FIELD_OBJ[_id] = {
			//decideByType,
			enabled,
			fieldType,
			fulltext,
			includeInAllText,
			key,
			max,
			min,
			nGram//,
			//path
		};
		return {
			key: _id,
			text: key,
			value: _id
		};
	});

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
		//console.debug('NewOrEditDocumentType useEffect');
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
		<Modal.Content>
			<Form as='div'>
				<Form.Field>
					<Input
						fluid
						label={{basic: true, content: 'Name'}}
						path='_name'
						placeholder='Please input an unique name'
					/>
				</Form.Field>

				<Header as='h2'>Fields</Header>

				<Form.Field>
					<Checkbox
						label='Add new fields automatically when creating/updating documents?'
						name='addFields'
						toggle
					/>
				</Form.Field>

				<Table celled compact selectable singleLine striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Active</Table.HeaderCell>
							<Table.HeaderCell>Field</Table.HeaderCell>
							<Table.HeaderCell>Value type</Table.HeaderCell>
							<Table.HeaderCell>Min</Table.HeaderCell>
							<Table.HeaderCell>Max</Table.HeaderCell>
							<Table.HeaderCell>Indexing</Table.HeaderCell>
							<Table.HeaderCell>Fulltext</Table.HeaderCell>
							<Table.HeaderCell>nGram</Table.HeaderCell>
							<Table.HeaderCell>Include in _allText</Table.HeaderCell>
							<Table.HeaderCell>Delete</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						<List
							path={PATH_FIELDS}
							render={(fieldsArray) => {
								//console.debug(`NewOrEditDocumentType fieldsArray`, fieldsArray);
								if(!fieldsArray.length) {
									return <Popup
										content='Add global field'
										inverted
										trigger={<InsertButton
											path={PATH_FIELDS}
											index={0}
											value={FIELD_DEFAULT}
										><Icon color='green' name='add'/>Add global field</InsertButton>}
									/>;
								}
								return <>
									{(() => {
										const selectedFields = {};
										return fieldsArray.map(({
											active,
											fieldId
										}, index) => {
											if (fieldId) {
												selectedFields[fieldId] = true;
											}
											const fieldObj = fieldId && GLOBAL_FIELD_OBJ[fieldId] || {};
											//console.debug('NewOrEditDocumentType fieldId', fieldId, 'fieldObj', fieldObj);
											const {
												//decideByType,
												enabled,
												fieldType,
												fulltext,
												includeInAllText,
												key,
												max,
												min,
												nGram//,
												//path
											} =  fieldObj;
											//console.debug('NewOrEditDocumentType active', active, 'key', key);
											const PATH_FIELD = `${PATH_FIELDS}.${index}`;
											return <Table.Row key={index}>
												<Table.Cell><Checkbox
													name='active'
													parentPath={PATH_FIELD}
													toggle
													value={active}
												/></Table.Cell>
												<Table.Cell disabled={true} style={{
													textDecoration: active ? 'none' : 'line-through'
												}}>{key}</Table.Cell>
												<Table.Cell disabled={true}>{active ? fieldType : null}</Table.Cell>
												<Table.Cell disabled={true}>{active ? min : null}</Table.Cell>
												<Table.Cell disabled={true}>{active ? max : null}</Table.Cell>
												<Table.Cell>{active
													? (enabled === true || enabled === false)
														? <Icon color='grey' disabled={true} name={enabled ? 'checkmark' : 'x'} size='large'/>
														: null // enabled === undefined
													: null // !active
												}</Table.Cell>
												<Table.Cell>{(active && enabled)
													? (fulltext === true || fulltext === false)
														? <Icon color='grey' disabled={true} name={fulltext ? 'checkmark' : 'x'} size='large'/>
														: null // fulltext === undefined
													: null // !active
												}</Table.Cell>
												<Table.Cell>{(active && enabled)
													? (nGram === true || nGram === false)
														? <Icon color='grey' disabled={true} name={nGram ? 'checkmark' : 'x'} size='large'/>
														: null // nGram === undefined
													: null // !active
												}</Table.Cell>
												<Table.Cell>{(active && enabled)
													? (includeInAllText === true || includeInAllText === false)
														? <Icon color='grey' disabled={true} name={includeInAllText ? 'checkmark' : 'x'} size='large'/>
														: null // includeInAllText === undefined
													: null // !active
												}</Table.Cell>
												<Table.Cell collapsing>
													<Button.Group>
														<RemoveFieldFromDocumentTypeModal
															collections={collections}
															index={index}
															interfaces={interfaces}
															name={key}
															path={PATH_FIELDS}
															servicesBaseUrl={servicesBaseUrl}
														/>
													</Button.Group>
												</Table.Cell>
											</Table.Row>;
										}); // map
									})()}
								</>;
							}}
						/>
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
										><Icon color='green' name='add'/>Add local field</InsertButton>}
									/>;
								}
								return <>{propertiesArray.map(({
									active,
									enabled,
									max,
									min,
									name/*,
								valueType*/
								}, index) => {
									const PATH_PROPERTY = `${PATH_PROPERTIES}.${index}`;
									return <Table.Row key={PATH_PROPERTY}>
										<Table.Cell><Checkbox
											name='active'
											parentPath={PATH_PROPERTY}
											toggle
											value={active}
										/></Table.Cell>
										<Table.Cell disabled={!active} style={{
											textDecoration: active ? 'none' : 'line-through'
										}}>{name}</Table.Cell>
										<Table.Cell collapsing>
											{active ? <EnonicDropdown
												disabled={!active}
												options={OPTIONS_VALUE_TYPES}
												name='valueType'
												parentPath={PATH_PROPERTY}
												selection
											/> : null}
										</Table.Cell>
										<Table.Cell>
											{active ? <Input
												disabled={!active}
												fluid
												name='min'
												parentPath={PATH_PROPERTY}
												type='number'
												value={min}
											/> : null}
										</Table.Cell>
										<Table.Cell>
											{active ? <Input
												disabled={!active}
												fluid
												name='max'
												parentPath={PATH_PROPERTY}
												type='number'
												value={max}
											/> : null}
										</Table.Cell>
										<Table.Cell collapsing>
											{active ? <Checkbox
												name='enabled'
												parentPath={PATH_PROPERTY}
												toggle
											/> : null}
										</Table.Cell>
										<Table.Cell collapsing>
											{active && enabled ? <Checkbox
												disabled={!active || !enabled}
												name='fulltext'
												parentPath={PATH_PROPERTY}
												toggle
											/> : null}
										</Table.Cell>
										<Table.Cell collapsing>
											{active && enabled ? <Checkbox
												disabled={!active || !enabled}
												name='ngram'
												parentPath={PATH_PROPERTY}
												toggle
											/> : null}
										</Table.Cell>
										<Table.Cell collapsing>
											{active && enabled ? <Checkbox
												disabled={!active || !enabled}
												name='includeInAllText'
												parentPath={PATH_PROPERTY}
												toggle
											/> : null}
										</Table.Cell>
										<Table.Cell collapsing>
											<Button.Group>
												<RemoveFieldFromDocumentTypeModal
													collections={collections}
													index={index}
													interfaces={interfaces}
													name={name}
													path={PATH_PROPERTIES}
													servicesBaseUrl={servicesBaseUrl}
												/>
											</Button.Group>
										</Table.Cell>
									</Table.Row>;
								})}
								</>;
							}}
						/>
					</Table.Body>
				</Table>
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button icon floated='left' onClick={() => {
				setFieldModalState({
					local: true,
					open: true
				});
			}}><Icon color='green' name='add'/> Add field</Button>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton secondary/>
			<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
		<AddFieldModal
			doClose={() => setFieldModalState((prev) => ({
				local: prev.local,
				open: false
			}))}
			globalFieldObj={GLOBAL_FIELD_OBJ}
			globalFieldOptions={GLOBAL_FIELD_OPTIONS}
			local={fieldModalState.local}
			open={fieldModalState.open}
		/>
	</EnonicForm>
		: <>
			<Modal.Content><Segment>
				<Dimmer active inverted>
					<Loader inverted>Loading</Loader>
				</Dimmer>
			</Segment></Modal.Content>
			<Modal.Actions>
				<Button onClick={doClose}>Cancel</Button>
			</Modal.Actions>
		</>;
} // NewOrEditDocumentType
