import React from 'react';
import {
	Button,
	Dimmer,
	Form,
	Icon,
	Loader,
	Modal,
	Segment,
	Tab,
	// Message,
	Radio
} from 'semantic-ui-react';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../../services/graphQL/mutations/documentTypeCreateMutation';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../../services/graphQL/mutations/documentTypeUpdateMutation';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../../services/graphQL/queries/documentTypeGetQuery';

// import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
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
	}
}

/***
 * Creates an semanic ui react error
 * @param header string Headline for the error message
 * @param messsage string The actual error message itself
 */
/* function createErrorMessage(header, message) {
	return <Message icon negative>
		<Icon name="warning"/>
		<Message.Content>
			<Message.Header>{header}</Message.Header>
			{message}
		</Message.Content>
	</Message>;
} */

export function NewOrEditDocumentType({
	doClose = () => {},
	_id, // optional
	_name, // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	servicesBaseUrl,
	setModalState,
	documentTypes
}) {
	const [state, setState] = React.useState({
		_name: '',
		_versionKey: undefined,
		addFields: true,
		properties: []
	});
	const [error, setError] = React.useState(false as Boolean | String);
	const [name, setName] = React.useState('');
	const [activeInput, setActiveInput] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(_id ? true : false);

	function getDocumentType(id) {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_QUERY_DOCUMENT_TYPE_GET,
				variables: {
					_id: id
				}
			})
		})
			.then(response => response.json())
			.then(result => {
				const data = result.data.getDocumentType;
				setState({...data});
				setIsLoading(false);
			});
	}

	React.useEffect(() => {
		if (!_id && activeInput) {
			const validOrError = validateName(name, documentTypes);

			if (validOrError) {
				setError(validOrError);
			} else {
				setError(false);
			}
		} else {
			// Reset potential errors, so nothing is disabled
			setError(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name]);

	React.useEffect(() => {
		/*fetchFields({
			handleData: (data) => {
				setGlobalFields(data.queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		}); */

		if (_id) {
			getDocumentType(_id);
		}
	}, []); // After first paint only

	if (state.properties) {
		state.properties.forEach(({name}) => {
			state.properties[name] = true;
		});
	}

	let disabled;
	if (!_id) {
		if (!activeInput || error) {
			disabled = true;
		} else {
			disabled = false;
		}
	} else {
		disabled = false;
	}

	/**
	 * Creates or updates a document model with a fetch call
	 * @param {object} data stat that the document will be updated to
	 * @param {function} success method that will be called when completed
	 * @param {callback} [failure=function(Print error)] optional method that will be called when something goes wrong
	 */
	function createOrUpdateDocument(data, success, failure = error => {
		console.error(error);
	}) {
		const variables = {
			_name: data._name,
			addFields: data.addFields,
			properties: data.properties
		} as {
			_name :any,
			addFields :any,
			properties :any,
			_id? :any,
			_versionKey :any,
		};

		if (_id) {
			variables._id = _id;
			variables._versionKey = state._versionKey;
		}

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
			if (response.status === 200) {
				return response.json();
			} else {
				throw response;
			}
		}).then(response => {
			success(response);
		}).catch(error => {
			failure(error);
		});
	}

	/**
	 * The state handles all form values, so we can call this freely.
	 */
	function submitDocumentForm() {
		setIsLoading(true);
		// get the currnt name. (even if its allready set in storrage)
		state._name = _name || name;

		createOrUpdateDocument(state, response => {
			if (response.errors) {
				console.error(`Getting the documenttype json`);
				console.error(response.errors);
			} else {
				if (_id) {
					doClose();
				} else {
					const resultDocumentType = response.data.createDocumentType;
					const updateId = resultDocumentType._id;
					const updateName = resultDocumentType._name;

					setModalState(prev => ({
						...prev,
						_id: updateId,
						_name: updateName,
						open: true
					}));
					getDocumentType(updateId);
				}
			}

		});
	}

	return !isLoading
		?
		<>
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
										interfacesArr={interfacesArr}
										servicesBaseUrl={servicesBaseUrl}
										properties={state.properties}
										updateOrDeleteProperties={function(newValues, index) {
											// Uncomment if we actually want to submit the value in addOrEditLocalFieldModal
											// createOrUpdateDocument(state, () => {
											setState(prev => {
												let next = prev;
												if (newValues == null) {
													delete(next.properties[index]);
												} else {
													next.properties[index] = {...newValues};
												}

												return {
													...next
												};
											});
											// });
										}}
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
								<Form>
									<Form.Field>
										{ _id ?
											<Form.Input
												fluid
												label="Name"
												disabled={true}
												value={_name}
											/>
											:
											<Form.Input
												fluid
												onChange={(event, data) => {
													// setName(data.value);
													setName(data.value);

													if (!activeInput) {
														setActiveInput(true);
													}
												}}
												label='Name'
												path='_name'
												placeholder='Please input an unique name'
												value={name}
												error={error}
											/>
										}
									</Form.Field>
									<Form.Field>
										<Radio
											label='Add new fields automatically when creating/updating documents?'
											name='addFields'
											onChange= {(event, data) => {
												setState(prev => {
													return {
														...prev,
														addFields: data.checked
													};
												});
											}}
											toggle
											checked={state.addFields}
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
				{
					//TODO replace
					/* {_id ? <ResetButton floated='left' secondary/> : null} */
				}
				<Button onClick={() => doClose()}>Cancel</Button>
				<Button disabled={disabled} onClick={()=>{submitDocumentForm();}} primary>
					<Icon name='save'/>Save
				</Button>
			</Modal.Actions>
		</>
		: <>
			<Modal.Content>
				<Segment>
					<Dimmer active inverted>
						<Loader inverted>Loading</Loader>
					</Dimmer>
				</Segment>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={() => doClose()}>Cancel</Button>
			</Modal.Actions>
		</>;
} // NewOrEditDocumentType
