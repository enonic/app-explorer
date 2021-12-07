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
	Radio
} from 'semantic-ui-react';
// import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
// import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
// import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
// import {Input} from 'semantic-ui-react-form/inputs/Input';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../../services/graphQL/mutations/documentTypeCreateMutation';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../../services/graphQL/mutations/documentTypeUpdateMutation';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../../services/graphQL/queries/documentTypeGetQuery';

import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {nameValidator} from '../utils/nameValidator';
import {FieldsList} from './FieldsList';

/**
 * Validated the name input
 * @param {String} value from an input button
 * @returns {String | boolean} string with error or true
 */
function validateName(value, documentTypes) {
	const result = nameValidator(value);
	// NameValidator sets undefined when no error. Object on error
	if (result) {
		return result;
	} else {
		for (let i=0; i<documentTypes.length; i++) {
			if (documentTypes[i]._name === value) {
				return `The name ${value} is already taken`;
			}
		}

		return true;
	}
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

const initialState = {
	_name: '',
	addFields: true,
	properties: [],
	firstInput: true
};

export function NewOrEditDocumentType({
	doClose = () => {},
	_id, // optional
	_name: documentTypeName, // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	servicesBaseUrl,
	setModalState,
	documentTypes
}) {
	const [{_name, addFields, _versionKey, properties, firstInput}, setState] = React.useState(_id ? false : initialState);
	const [globalFields, setGlobalFields] = React.useState([]);
	const [error, setError] = React.useState(null);

	function getDocumentType() {
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
				console.log(data);
				//TODO
				// setState(data.data.getDocumentType);
			});
	}

	React.useEffect(() => {
		if (_id === undefined && !firstInput) {
			const validOrError = validateName(_name, documentTypes);
			console.debug('Validate name');
			if (validOrError !== true) {
				setError(createErrorMessage('Name', validOrError));
			} else {
				setError(null);
			}
		} else {
			// Reset potential errors, so nothing is disabled
			setError(null);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_name, documentTypes]);

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
			// Get document type
			console.log("GetDocumentType");
			getDocumentType();
		}
	}, []); // After first paint only

	if (properties) {
		properties.forEach(({name}) => {
			properties[name] = true;
		});
	}


	let disabled;
	if (error || !_id) {
		if (!_id && !firstInput) {
			disabled == true;
		} else {
			disabled = false;
		}
	}

	return properties
		?
		<>
			<Modal.Content>
				<Form
					id='documentForm'
					onSubmit={(values) => {
						//TODO check values
						console.debug(values);
						const {addFields, properties} = values;

						const variables = {
							_name,
							addFields,
							properties
						};

						if (_id) {
							variables._id = _id;
							variables._versionKey = _versionKey;
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
												open: true
											}));
										}
										// setInitialValues(false); // Should unmount the EnonicForm, trigger getDocumentType, and remount Enonicform?
									});
								}
							}
						});
					}}
				>
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
											<Form.Input
												fluid
												disabled={_id ? true : false}
												onChange={(event, data) => {
													setInitialValues(prev => {
														const next = prev;
														next._name = data.value;
														if (next.firstInput) {
															next.firstInput = false;
														}
														return next;
													});
												}}
												label='Name'
												path='_name'
												placeholder='Please input an unique name'
												value={_name || ""}
												error={error}
											/>
										</Form.Field>
										<Form.Field>
											<Radio
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
				</Form>
			</Modal.Content>
			<Modal.Actions>
				{
					//TODO replace
					/* {_id ? <ResetButton floated='left' secondary/> : null} */
				}
				<Button onClick={() => doClose()}>Cancel</Button>
				<Button form="documentForm" type="submit" disabled={disabled} color={() => null} primary><Icon name='save'/>Save</Button>
			</Modal.Actions>
		</>
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
