import type {JSONResponse}  from './index.d';
import type {Stopword} from '/lib/explorer/types/StopWord.d';


import {GQL_MUTATION_STOP_WORDS_CREATE} from '../mutations/stopWordsCreateMutation';


export type FetchStopWordsCreateData = {
	createStopWords :Stopword
}


export async function fetchStopWordsCreate({
	url,
	variables: {
		_name,
		words = []
	},
	handleData = (data :FetchStopWordsCreateData) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug(
			'fetchStopWordsCreate(',{
				url,
				variables: {
					_name,
					words
				}
			},') handleData() --> data:',
			data
		);
	},
	handleResponse = async (response) => {
		const {data, errors} = await response.json() as JSONResponse<FetchStopWordsCreateData>;
		/*console.debug(
			'fetchStopWordsCreate(',{
				url,
				variables: {
					_name,
					words
				}
			},') handleResponse() data:',
			data
		);*/
		if (response.ok) {
			return handleData(data);
		} else {
			// handle the graphql errors
    		const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
    		return Promise.reject(error);
		}
	}
} :{
	handleData ?:(data :FetchStopWordsCreateData) => void
	handleResponse ?:(response :Response) => void
	url :string
	variables ?:{
		_name :string
		words ?:Array<string>
	}
}) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_STOP_WORDS_CREATE,
			variables: {
				_name,
				words
			}
		})
	})
		.then(response => handleResponse(response));
}
