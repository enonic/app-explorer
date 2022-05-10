import type {
	DocumentTypeFields,
	DocumentType
} from '/lib/explorer/types/index.d';
import type {JSONResponse} from './index.d';


import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../mutations/documentTypeUpdateMutation';


export type FetchDocumentTypeUpdateData = {
	updateDocumentType :DocumentType
}


export async function fetchDocumentTypeUpdate({
	url,
	variables: {
		_id,
		_name,
		_versionKey,
		addFields = true,
		properties = []
	},
	handleResponse = async (response) => {
		const {data, errors} = await response.json() as JSONResponse<FetchDocumentTypeUpdateData>;
		if (response.ok) {  // is this the same as response.status === 200 ?
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
		_id :string
		_name :string
		_versionKey :string
		addFields ?:boolean
		properties ?:DocumentTypeFields
	},
	handleResponse ?:(response :Response) => Promise<FetchDocumentTypeUpdateData>
}) {
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_DOCUMENT_TYPE_UPDATE,
			variables: {
				_id,
				_name,
				_versionKey,
				addFields,
				properties
			}
		})
	})
		.then(response => handleResponse(response));
}
