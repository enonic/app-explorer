import {
	Button,
	Dimmer,
	Form,
	Icon,
	Loader,
	Modal,
	Segment,
	Tab
} from 'semantic-ui-react';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../../services/graphQL/mutations/documentTypeCreateMutation';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../../services/graphQL/mutations/documentTypeUpdateMutation';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../../services/graphQL/queries/documentTypeGetQuery';

import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {nameValidator} from '../utils/nameValidator';
import {FieldsList} from './FieldsList';


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
	_id: idProp, // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	servicesBaseUrl
}) {
	const [_id, setId] = React.useState(idProp);
	const [initialValues, setInitialValues] = React.useState(_id ? false : {
		_name: '',
		addFields: true,
		properties: []
	});
	const [globalFields, setGlobalFields] = React.useState([]);
	/*const [fieldModalState, setFieldModalState] = React.useState({
		local: true,
		open: false
	});*/
	//console.debug(`NewOrEditDocumentType initialValues`, initialValues);
	//console.debug(`NewOrEditDocumentType globalFields`, globalFields);

	function getDocumentType() {
		//console.debug('getDocumentType() called');
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_QUERY_DOCUMENT_TYPE_GET,
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
	}

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
	}, []);

	React.useEffect(() => {
		//console.debug('useEffect: initialValues changed');
		if (_id && !initialValues) {
			//console.debug('useEffect: _id && initialValues falsy');
			getDocumentType();
		}
	}, [initialValues]); // After first paint and whenever initialValues changes.

	const initialProperties = {};
	if (initialValues) {
		if (initialValues.properties) {
			initialValues.properties.forEach(({name}) => {
				initialProperties[name] = true;
			});
		}
	}

	return initialValues ? <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//console.debug('submit values', values);
			const {_name, addFields, properties} = values;
			//console.debug('submit _name', _name);

			const variables = {
				_name,
				addFields,
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
					query: _id ? GQL_MUTATION_DOCUMENT_TYPE_UPDATE : GQL_MUTATION_DOCUMENT_TYPE_CREATE,
					variables
				})
			}).then(response => {
				//console.debug('response', response);
				if (response.status === 200) {
					if (_id) {
						doClose();
					} else {
						//console.debug('response.json()', response.json()); // Promise
						response.json().then(json => {
							//console.debug('json', json);
							const {
								_id/*,
								_name,
								addFields,
								properties*/
							} = json.data.createDocumentType;
							/*setInitialValues({ // So reset button doesn't empty all inputs
								_name,
								addFields,
								properties
							});*/
							setId(_id);
							setInitialValues(false); // Should unmount the EnonicForm, trigger getDocumentType, and remount Enonicform?
						});
					}
				}
			});
		}}
		schema={SCHEMA}
	>
		<Modal.Content>
			<Tab
				defaultActiveIndex={0}
				panes={(() => {
					const panes = [];
					if (_id) {
						panes.push({
							menuItem: {
								content: 'Fields',
								icon: 'list',
								key: 'fields'
							},
							render: () => <Tab.Pane>
								<FieldsList
									collectionsArr={collectionsArr}
									globalFields={globalFields}
									interfacesArr={interfacesArr}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Tab.Pane>
						});
					} // if _id
					panes.push({
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
					});
					return panes;
				})()}
				renderActiveOnly={true/*For some reason everything is gone when set to false???*/}
			/>
		</Modal.Content>
		<Modal.Actions>
			{_id ? <ResetButton floated='left' secondary/> : null}
			<Button onClick={() => doClose()}>Cancel</Button>
			<SubmitButton color={() => null} primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
	</EnonicForm>
		: <>
			<Modal.Content><Segment>
				<Dimmer active inverted>
					<Loader inverted>Loading</Loader>
				</Dimmer>
			</Segment></Modal.Content>
			<Modal.Actions>
				<Button onClick={() => doClose()}>Cancel</Button>
			</Modal.Actions>
		</>;
} // NewOrEditDocumentType
