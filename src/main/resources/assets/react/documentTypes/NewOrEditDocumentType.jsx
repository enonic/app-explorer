import {
	/*VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,*/
	VALUE_TYPE_STRING
} from '@enonic/js-utils';

import {
	Button,
	Dimmer,
	Form,
	Icon,
	Loader,
	Modal,
	Popup,
	Segment,
	Tab,
	Table
} from 'semantic-ui-react';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
//import {Dropdown as EnonicDropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {List} from 'semantic-ui-react-form/List';

import {GQL_MUTATION_CREATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationCreateDocumentType';
import {GQL_MUTATION_UPDATE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationUpdateDocumentType';
import {GQL_QUERY_GET_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/queryGetDocumentType';
import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {Checkmark} from '../components/Checkmark';
import {Span} from '../components/Span';
import {nameValidator} from '../utils/nameValidator';
//import {AddFieldModal} from './AddFieldModal';
import {AddOrEditLocalField} from './AddOrEditLocalField';
import {GlobalFields} from './GlobalFields';
import {RemoveFieldFromDocumentTypeModal} from './RemoveFieldFromDocumentTypeModal';


const PATH_FIELDS = 'fields';
const PATH_PROPERTIES = 'properties';

/*const OPTIONS_VALUE_TYPES = [
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
}));*/


const FIELD_DEFAULT = {
	active: true,
	fieldId: ''
};

/*const PROPERTY_DEFAULT = {
	active: true,
	enabled: true,
	fulltext: true,
	includeInAllText: true,
	max: 0,
	min: 0,
	name: '',
	nGram: true,
	path: false,
	valueType: VALUE_TYPE_STRING
};*/


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
	/*const [fieldModalState, setFieldModalState] = React.useState({
		local: true,
		open: false
	});*/
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
	//const GLOBAL_FIELD_OPTIONS = globalFields.map(({
	globalFields.forEach(({
		_id,
		//decideByType,
		enabled,
		fieldType,
		fulltext,
		includeInAllText,
		key,
		max,
		min,
		nGram,
		path
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
			nGram,
			path
		};
		/*return {
			key: _id,
			text: key,
			value: _id
		};*/
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
			<Tab
				defaultActiveIndex={0}
				panes={[{
					menuItem: {
						content: 'Settings',
						icon: 'setting',
						key: 'settings'
					},
					render: () => <Tab.Pane>
						<Form as='div'>
							<Form.Field>
								<Input
									fluid
									label={{basic: true, content: 'Name'}}
									path='_name'
									placeholder='Please input an unique name'
								/>
							</Form.Field>
							<Form.Field>
								<Checkbox
									label='Add new fields automatically when creating/updating documents?'
									name='addFields'
									toggle
								/>
							</Form.Field>
						</Form>
					</Tab.Pane>
				}, {
					menuItem: {
						content: 'Global fields',
						icon: 'globe',
						key: 'globalFields'
					},
					render: () => <Tab.Pane>
						<GlobalFields globalFields={globalFields}/>
					</Tab.Pane>
				}, {
					menuItem: {
						content: 'Fields',
						icon: 'list',
						key: 'fields'
					},
					render: () => <Tab.Pane>
						<Table celled compact selectable singleLine striped>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell collapsing>Active</Table.HeaderCell>
									<Table.HeaderCell collapsing>Edit</Table.HeaderCell>
									<Table.HeaderCell>Field</Table.HeaderCell>
									<Table.HeaderCell collapsing>Value type</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
									<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
									<Table.HeaderCell collapsing>Delete</Table.HeaderCell>
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
														nGram,
														path
													} =  fieldObj;
													//console.debug('NewOrEditDocumentType active', active, 'key', key);
													const PATH_FIELD = `${PATH_FIELDS}.${index}`;
													return <Table.Row key={index}>
														<Table.Cell collapsing><Checkbox
															name='active'
															parentPath={PATH_FIELD}
															toggle
															value={active}
														/></Table.Cell>
														<Table.Cell collapsing></Table.Cell>
														<Table.Cell disabled={!active} style={{
															textDecoration: active ? 'none' : 'line-through'
														}}><Span color='grey'>{key}</Span></Table.Cell>
														<Table.Cell collapsing><Span color='grey'>{active ? fieldType : null}</Span></Table.Cell>
														<Table.Cell collapsing textAlign='center'>{active ? <Span color='grey'>{min === 0 ? null : min}</Span> : null}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{active ? <Span color='grey'>{max === 0 ? '∞' : max}</Span> : null}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{active
															? (enabled === true || enabled === false)
																? <Checkmark disabled checked={enabled} size='large'/>
																: null // enabled === undefined
															: null // !active
														}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{(active && enabled)
															? (includeInAllText === true || includeInAllText === false)
																? <Checkmark disabled checked={includeInAllText} size='large'/>
																: null // includeInAllText === undefined
															: null // !active
														}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{(active && enabled)
															? (fulltext === true || fulltext === false)
																? <Checkmark disabled checked={fulltext} size='large'/>
																: null // fulltext === undefined
															: null // !active
														}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{(active && enabled)
															? (nGram === true || nGram === false)
																? <Checkmark disabled checked={nGram} size='large'/>
																: null // nGram === undefined
															: null // !active
														}</Table.Cell>
														<Table.Cell collapsing textAlign='center'>{(active && enabled)
															? (path === true || path === false)
																? <Checkmark disabled checked={path} size='large'/>
																: null // nGram === undefined
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
										/*if(!propertiesArray.length) {
											return <Popup
												content='Add local field'
												inverted
												trigger={<InsertButton
													path={PATH_PROPERTIES}
													index={0}
													value={PROPERTY_DEFAULT}
												><Icon color='green' name='add'/>Add local field</InsertButton>}
											/>;
										}*/
										return <>{propertiesArray.map(({
											active,
											enabled,
											fulltext,
											includeInAllText,
											max,
											min,
											name,
											nGram,
											path,
											valueType
										}, index) => {
											console.debug('nGram', nGram);
											const PATH_PROPERTY = `${PATH_PROPERTIES}.${index}`;
											return <Table.Row key={PATH_PROPERTY}>
												<Table.Cell collapsing><Checkbox
													name='active'
													parentPath={PATH_PROPERTY}
													toggle
													value={active}
												/></Table.Cell>
												<Table.Cell collapsing>
													<AddOrEditLocalField
														fulltext={fulltext}
														globalFieldObj={GLOBAL_FIELD_OBJ}
														includeInAllText={includeInAllText}
														max={max}
														min={min}
														name={name}
														nGram={nGram}
														path={path}
														valueType={valueType}
													/>
												</Table.Cell>
												<Table.Cell disabled={!active} style={{
													textDecoration: active ? 'none' : 'line-through'
												}}>{name}</Table.Cell>
												<Table.Cell collapsing>
													{active ? <Span color='grey'>{valueType}</Span>/*<EnonicDropdown
														disabled={!active}
														options={OPTIONS_VALUE_TYPES}
														name='valueType'
														parentPath={PATH_PROPERTY}
														selection
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active ? <Span color='grey'>{min === 0 ? null : min}</Span>/*<Input
														disabled={!active}
														fluid
														name='min'
														parentPath={PATH_PROPERTY}
														type='number'
														value={min}
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active ? <Span color='grey'>{max === 0 ? '∞' : max}</Span>/*<Input
														disabled={!active}
														fluid
														name='max'
														parentPath={PATH_PROPERTY}
														type='number'
														value={max}
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active ? <Checkmark disabled checked={enabled} size='large'/>/*<Checkbox
														name='enabled'
														parentPath={PATH_PROPERTY}
														toggle
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active && enabled ? <Checkmark disabled checked={includeInAllText} size='large'/>/*<Checkbox
														disabled={!active || !enabled}
														name='includeInAllText'
														parentPath={PATH_PROPERTY}
														toggle
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active && enabled ? <Checkmark disabled checked={fulltext} size='large'/>/*<Checkbox
														disabled={!active || !enabled}
														name='fulltext'
														parentPath={PATH_PROPERTY}
														toggle
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active && enabled ? <Checkmark disabled checked={nGram} size='large'/>/*<Checkbox
														disabled={!active || !enabled}
														name='nGram'
														parentPath={PATH_PROPERTY}
														toggle
													/>*/ : null}
												</Table.Cell>
												<Table.Cell collapsing textAlign='center'>
													{active && enabled ? <Checkmark disabled checked={path} size='large'/>/*<Checkbox
														disabled={!active || !enabled}
														name='path'
														parentPath={PATH_PROPERTY}
														toggle
													/>*/ : null}
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
						<AddOrEditLocalField
							globalFieldObj={GLOBAL_FIELD_OBJ}
						/>
						{/*<Button icon onClick={() => {
							setFieldModalState({
								local: true,
								open: true
							});
						}}><Icon color='green' name='add'/> Add field</Button>*/}
					</Tab.Pane>
				}]}
				renderActiveOnly={true/*For some reason everything is gone when set to false???*/}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton secondary/>
			<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
		{/*<AddFieldModal
			doClose={() => setFieldModalState((prev) => ({
				local: prev.local,
				open: false
			}))}
			globalFieldObj={GLOBAL_FIELD_OBJ}
			globalFieldOptions={GLOBAL_FIELD_OPTIONS}
			local={fieldModalState.local}
			open={fieldModalState.open}
		/>*/}
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
