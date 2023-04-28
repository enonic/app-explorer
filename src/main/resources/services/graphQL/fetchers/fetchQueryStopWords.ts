import type {JSONResponse}  from './index.d';
import type {QueriedStopword} from '@enonic-types/lib-explorer/Stopword.d';


import {GQL_QUERY_STOP_WORDS} from '../queries/queryStopWords';


export type QueryStopWordsResult = {
	count :number
	total :number
	hits :Array<QueriedStopword>
}

export type FetchQueryStopWordsData = {
	queryStopWords :QueryStopWordsResult
}


export async function fetchQueryStopWords({
	url,
	variables: {
		count = -1
	} = {},
	handleData = (data :FetchQueryStopWordsData) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug(
			'fetchQueryStopWords(',{
				url,
				variables: {
					count
				}
			},') handleData() --> data:',
			data
		);
	},
	handleResponse = async (response) => {
		const {data, errors} = await response.json() as JSONResponse<FetchQueryStopWordsData>;
		/*console.debug(
			'fetchQueryStopWords(',{
				url,
				variables: {
					count
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
	handleData? :(data :FetchQueryStopWordsData) => void
	handleResponse? :(response :Response) => void
	url :string
	variables? :{
		count? :number
	}
}) {
	await fetch(url, {
		method: 'POST',
		headers: { // HTTP/2 uses lowercase header keys
			'content-type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_STOP_WORDS,
			variables: {
				count
			}
		})
	})
		.then(response => handleResponse(response));
}
