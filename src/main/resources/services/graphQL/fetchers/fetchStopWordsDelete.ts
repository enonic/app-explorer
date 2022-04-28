import type {JSONResponse}  from './index.d';


import {GQL_MUTATION_STOP_WORDS_DELETE} from '../mutations/stopWordsDeleteMutation';


export type FetchStopWordsDeleteData = {
	deleteStopWords :{
		_id :string
	}
}


export async function fetchStopWordsDelete({
	url,
	variables: {
		_id
	},
	handleResponse = async (response) => {
		const {errors} = await response.json() as JSONResponse<FetchStopWordsDeleteData>;
		if (!response.ok) {
			// handle the graphql errors
    		const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
    		return Promise.reject(error);
		}
	}
} :{
	handleResponse ?:(response :Response) => void
	url :string
	variables ?:{
		_id :string
	}
}) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_STOP_WORDS_DELETE,
			variables: {
				_id
			}
		})
	})
		.then(response => handleResponse(response));
}
