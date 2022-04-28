import type {JSONResponse}  from './index.d';
import type {Stopword} from '/lib/explorer/types/StopWord.d';


import {GQL_MUTATION_STOP_WORDS_UPDATE} from '../mutations/stopWordsUpdateMutation';


export type FetchStopWordsUpdateData = {
	createStopWords :Stopword
}


export async function fetchStopWordsUpdate({
	url,
	variables: {
		_id,
		words = []
	},
	handleData = (data :FetchStopWordsUpdateData) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug(
			'fetchStopWordsUpdate(',{
				url,
				variables: {
					_id,
					words
				}
			},') handleData() --> data:',
			data
		);
	},
	handleResponse = async (response) => {
		const {data, errors} = await response.json() as JSONResponse<FetchStopWordsUpdateData>;
		/*console.debug(
			'fetchStopWordsUpdate(',{
				url,
				variables: {
					_id,
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
	handleData ?:(data :FetchStopWordsUpdateData) => void
	handleResponse ?:(response :Response) => void
	url :string
	variables ?:{
		_id :string
		words ?:Array<string>
	}
}) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_STOP_WORDS_UPDATE,
			variables: {
				_id,
				words
			}
		})
	})
		.then(response => handleResponse(response));
}
