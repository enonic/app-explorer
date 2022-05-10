import type {
	DocumentTypeFields,
	DocumentType
} from '/lib/explorer/types/index.d';
import type {JSONResponse} from './index.d';


import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../mutations/documentTypeCreateMutation';


export type FetchDocumentTypeCreateData = {
	createDocumentType :DocumentType
}


export async function fetchDocumentTypeCreate({
	url,
	variables: {
		_name,
		addFields = true,
		properties = []
	},
	handleResponse = async (response) => {
		// This code is only run if handleResponse is not passed in...
		const {data, errors} = await response.json() as JSONResponse<FetchDocumentTypeCreateData>;
		if (response.ok) { // is this the same as response.status === 200 ?
			return data;
		} else {
			// handle the graphql errors
    		const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
    		return Promise.reject(error);
		}
	}
} :{
	url :string
	variables :{
		_name :string
		addFields ?:boolean
		properties ?:DocumentTypeFields
	},
	handleResponse ?:(response :Response) => Promise<FetchDocumentTypeCreateData>
}) {
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_DOCUMENT_TYPE_CREATE,
			variables: {
				_name,
				addFields,
				properties
			}
		})
	})
		.then(response => handleResponse(response));
}
