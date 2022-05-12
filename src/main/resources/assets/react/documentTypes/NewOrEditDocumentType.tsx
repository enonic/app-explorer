import type {
	DocumentType,
	DocumentTypeField
} from '/lib/explorer/types/index.d';
import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';
import type {FetchDocumentTypeCreateData} from '../../../services/graphQL/fetchers/fetchDocumentTypeCreate';
import type {FetchDocumentTypeUpdateData} from '../../../services/graphQL/fetchers/fetchDocumentTypeUpdate';

import type {
	DocumentTypesObj,
	NewOrEditDocumentTypeComponentParams,
	NewOrEditDocumentTypeState
} from './index.d';


import {fold} from '@enonic/js-utils';
import * as React from 'react';
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

import {fetchDocumentTypeCreate} from '../../../services/graphQL/fetchers/fetchDocumentTypeCreate';
import {fetchDocumentTypeGet} from '../../../services/graphQL/fetchers/fetchDocumentTypeGet';
import {fetchDocumentTypeUpdate} from '../../../services/graphQL/fetchers/fetchDocumentTypeUpdate';

// import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {nameValidator} from '../utils/nameValidator';
import {FieldsList} from './FieldsList';


/**
 * Validates the name input
 */
function validateName(
	value :string, // value from an input button
	documentTypes :DocumentTypesObj
) :string|false {
	const result = nameValidator(value);
	// NameValidator sets undefined when no error. Object on error
	if (result) {
		return result;
	} else {
		if (documentTypes[value]) {
			return `The name ${value} is already taken`;
		}
	}
	return false;
}


export function NewOrEditDocumentType({
	// Required
	documentTypes,
	servicesBaseUrl,
	setModalState,
	// Optional
	_id,
	_name,
	doClose = () => {/**/}
} :NewOrEditDocumentTypeComponentParams) {
	const [state, setState] = React.useState<NewOrEditDocumentTypeState>({
		_name: '',
		_versionKey: undefined,
		addFields: true,
		properties: []
	});
	const [error, setError] = React.useState<string|false>(false);
	const [name, setName] = React.useState('');
	const [activeInput, setActiveInput] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(_id ? true : false);

	const memoizedFetchDocumentTypeGet = React.useCallback((id :string) => fetchDocumentTypeGet({
		url: `${servicesBaseUrl}/graphQL`,
		variables: {
			_id: id
		}
	})
		.then(data => {
			const documentType = data.getDocumentType;
			setState({...documentType});
			setIsLoading(false);
		}), [
		servicesBaseUrl
	]);

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
			memoizedFetchDocumentTypeGet(_id);
		}
	}, [
		_id,
		memoizedFetchDocumentTypeGet
	]); // After first paint only

	let disabled :boolean;
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
	 */
	async function createOrUpdateDocument(
		data :NewOrEditDocumentTypeState, // data state that the document will be updated to
		success :(data :FetchDocumentTypeCreateData|FetchDocumentTypeUpdateData) => void // success method that will be called when completed
	) {
		if (_id) {
			return fetchDocumentTypeUpdate({
				url: `${servicesBaseUrl}/graphQL`,
				variables: {
					_id,
					_name: data._name,
					_versionKey: state._versionKey,
					addFields: data.addFields,
					properties: data.properties
				},
				handleResponse: async (response) => {
					const {data, errors} = await response.json() as JSONResponse<FetchDocumentTypeUpdateData>;
					if (response.status === 200) {
						return data;
					} else {
						const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
						return Promise.reject(error);
					}
				}
			}).then(data => {
				success(data);
			}).catch(error => {
				console.error('Something went wrong while updating the documentType', error);
			});
		}
		return fetchDocumentTypeCreate({
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				_name: data._name,
				addFields: data.addFields,
				properties: data.properties
			},
			handleResponse: async (response) => {
				const {data, errors} = await response.json() as JSONResponse<FetchDocumentTypeCreateData>;
				if (response.status === 200) {
					return data;
				} else {
					const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
					return Promise.reject(error);
				}
			}
		}).then(data => {
			success(data);
		}).catch(error => {
			console.error('Something went wrong while creating the documentType', error);
		});
	} // createOrUpdateDocument

	/**
	 * The state handles all form values, so we can call this freely.
	 */
	function submitDocumentForm() {
		setIsLoading(true);
		// get the currnt name. (even if its allready set in storrage)
		state._name = _name || name;

		createOrUpdateDocument(state, (data) => {
			//console.debug('data', data);
			if (_id) {
				doClose();
			} else {
				const resultDocumentType :DocumentType = (data['createDocumentType'] || data['updateDocumentType']) as DocumentType;
				const updateId = resultDocumentType._id;
				const updateName = resultDocumentType._name;

				setModalState(prev => ({
					...prev,
					_id: updateId,
					_name: updateName,
					open: true
				}));
				memoizedFetchDocumentTypeGet(updateId);
			}
		});
	} // submitDocumentForm

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
										collectionNames={documentTypes[_name] ? documentTypes[_name].collectionNames || [] : []}
										interfaceNames={documentTypes[_name] ? documentTypes[_name].interfaceNames || [] : []}
										servicesBaseUrl={servicesBaseUrl}
										properties={state.properties}
										updateOrDeleteProperties={
											function(
												newValues :DocumentTypeField,
												index :number
											) {
												// Uncomment if we actually want to submit the value in addOrEditLocalFieldModal
												// createOrUpdateDocument(state, () => {
												setState(prev => {
													const next :NewOrEditDocumentTypeState = JSON.parse(JSON.stringify(prev)); // deref, so state gets new object id
													if (newValues == null) {
														delete(next.properties[index]);
													} else {
														next.properties[index] = {...newValues};
													}

													/*return { // deref, so state gets new object id
														...next
													};*/
													return next;
												});
												// });
											}
										}
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
												onChange={(
													//@ts-ignore
													event :unknown,
													data
												) => {
													// setName(data.value);
													setName(fold(data.value.toLowerCase()));

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
											onChange= {(
												//@ts-ignore
												event :unknown,
												data
											) => {
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
