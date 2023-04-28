import type {DocumentType} from '@enonic-types/lib-explorer';
import type {JSONResponse} from './index.d';


import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../queries/documentTypeGetQuery';


export type FetchDocumentTypeGetData = {
	getDocumentType :DocumentType
}


export async function fetchDocumentTypeGet({
	url,
	variables: {
		_id
	},
	handleResponse = async (response) => {
		// This code is only run if handleResponse is not passed in...
		const {data, errors} = await response.json() as JSONResponse<FetchDocumentTypeGetData>;
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
		_id :string
	},
	handleResponse ?:(response :Response) => Promise<FetchDocumentTypeGetData>
}) {
	return fetch(url, {
		method: 'POST',
		headers: { // HTTP/2 uses lowercase header keys
			'content-type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_DOCUMENT_TYPE_GET,
			variables: {
				_id
			}
		})
	}).then(response => handleResponse(response));
}
