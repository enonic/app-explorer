import {
	Button,
	Dimmer,
	Form,
	Icon,
	Loader,
	Modal,
	Segment,
	Tab,
	Message,
	Input as SemanticInput
} from 'semantic-ui-react';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
// import {Input} from 'semantic-ui-react-form/inputs/Input';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../../services/graphQL/mutations/documentTypeCreateMutation';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../../services/graphQL/mutations/documentTypeUpdateMutation';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../../services/graphQL/queries/documentTypeGetQuery';

import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {nameValidator} from '../utils/nameValidator';
import {FieldsList} from './FieldsList';
// import {fetchDocumentTypes} from '../../../services/graphQL/fetchers/fetchDocumentTypes.mjs';

const SCHEMA = {
	_name: (v) => nameValidator(v),
	properties: (properties) => {
		//console.debug('properties', properties);
		if (!Array.isArray(properties)) {
			return 'properties must be an array';
		}

		for (let i = 0; i < properties.length; i++) { // Can't return from forEach?
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

/***
 * Validated if the input document type name is valid
 * @param value String name of the new document type
 * @return Object
 * @return [object.error] possible error of if not valid
 */
function validateInput(value) {
	//console.debug('i', i, 'name', name);
	if(!value) {
		return {
			error: `Required!`
		};
	}
	const startsWithAnythingButLowercaseLetterRegexp = /^[^a-z]/;
	const startsWithAnythingButLowercaseLetter = value.match(startsWithAnythingButLowercaseLetterRegexp);
	if (startsWithAnythingButLowercaseLetter) {
		return {
			error: `Must start with a lowercase letter. Illegal characters: ${startsWithAnythingButLowercaseLetter.join('')}`
		};
	}
	const regexp =/[^a-zA-Z0-9_.]/g;
	const matches = value.match(regexp);
	//console.debug('i', i, 'name', name, 'matches', matches);
	if (matches) {
		return {
			error: `Only letters, digits, underscore and dot is allowed. Illegal characters: ${matches.join('')}`
		};
	}

	return {};
}

/***
 * Creates an semanic ui react error
 * @param header string Headline for the error message
 * @param messsage string The actual error message itself
 */
function createErrorMessage(header, message) {
	return <Message icon negative>
		<Icon name="warning"/>
		<Message.Content>
			<Message.Header>{header}</Message.Header>
			{message}
		</Message.Content>
	</Message>;
}

export function NewOrEditDocumentType({
	doClose = () => {},
	_id, // optional
	_name: documentTypeName, // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	servicesBaseUrl,
	setModalState,
	documentTypes,
	keepOpen
}) {
	const [initialValues, setInitialValues] = React.useState(_id ? false : {
		_name: '',
		addFields: true,
		properties: []
	});
	const [globalFields, setGlobalFields] = React.useState([]);
	const [error, setError] = React.useState([]);
	const [nameInput, setNameInput] = React.useState(documentTypeName);
	/*const [fieldModalState, setFieldModalState] = React.useState({
		local: true,
		open: false
	});*/

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
				// console.debug('data', data);
				setInitialValues(data.data.getDocumentType);
			});
	}

	React.useEffect(() => {
		let error = false;
		let errorMessage = null;

		if (_id == undefined) {
			const valid = validateInput(nameInput);
			if (valid.error !== undefined) {
				errorMessage = createErrorMessage('Name', valid.error);
				error = true;
			}

			for (let i=0; i<documentTypes.length; i++) {
				if (documentTypes[i]._name === nameInput) {
					errorMessage = createErrorMessage('Name', `The name ${nameInput} is already taken`);
					error = true;
				}
			}
			setError(errorMessage);
			if (error === false) {
				setNameInput(nameInput);
			}
		} else {
			// Reset potential errors, so nothing is disabled
			setError(null);
		}
	}, [nameInput, documentTypes]);

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

	const disabled = error ? true : false;

	return initialValues
		? <EnonicForm
			initialValues={initialValues}
			onSubmit={(values) => {
				//console.debug('submit values', values);
				const {addFields, properties} = values;
				const _name = nameInput;
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
						if (_id && !keepOpen) {
							doClose();
						} else {
							//console.debug('response.json()', response.json()); // Promise
							response.json().then(json => {
								//console.debug('json', json);
								if (json.errors) {
									console.error(`Getting the documenttype json`);
									console.error(json.errors);
									return;
								} else {
									const {
										_id,
										_name/*,
										addFields,
										properties*/
									} = json.data.createDocumentType;
									setModalState(prev => ({
										_id,
										_name,
										collectionsArr: prev.collectionsArr,
										interfacesArr: prev.interfacesArr,
										open: true,
										keepOpen: true
									}));
								}
								// setInitialValues(false); // Should unmount the EnonicForm, trigger getDocumentType, and remount Enonicform?
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
										documentTypeName={documentTypeName}
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
										<SemanticInput
											disabled={_id ? true : false}
											onChange={e => {setNameInput(e.target.value);}}
											fluid
											label={{basic: true, content: 'Name'}}
											path='_name'
											placeholder='Please input an unique name'
											value={nameInput || ""}
										/>
									</Form.Field>
									{error}
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
				<SubmitButton disabled={disabled} color={() => null} primary><Icon name='save'/>Save</SubmitButton>
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
