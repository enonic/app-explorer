import type {DocumentType} from '/lib/explorer/types/index.d';
import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';
import type {FetchDocumentTypeCreateData} from '../../../services/graphQL/fetchers/fetchDocumentTypeCreate';
import type {FetchDocumentTypeUpdateData} from '../../../services/graphQL/fetchers/fetchDocumentTypeUpdate';
import type {
	DocumentTypeModal,
	DocumentTypesObj,
	NewOrEditDocumentTypeState
} from './index.d';


import * as React from 'react';
import {fetchDocumentTypeCreate} from '../../../services/graphQL/fetchers/fetchDocumentTypeCreate';
import {fetchDocumentTypeGet} from '../../../services/graphQL/fetchers/fetchDocumentTypeGet';
import {fetchDocumentTypeUpdate} from '../../../services/graphQL/fetchers/fetchDocumentTypeUpdate';
// import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {nameValidator} from '../utils/nameValidator';


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


export function useNewOrEditDocumentTypeState({
	_id,
	_name,
	doClose,
	documentTypes,
	servicesBaseUrl,
	setModalState
} :{
	_id ?:string
	_name ?:string
	doClose :() => void
	documentTypes :DocumentTypesObj
	servicesBaseUrl :string
	setModalState :React.Dispatch<React.SetStateAction<DocumentTypeModal>>
}) {
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
	return {
		activeInput,
		disabled,
		error,
		isLoading,
		name,
		setActiveInput,
		setName,
		setState,
		state,
		submitDocumentForm
	};
}
