import {
	type FetchInterfaceVariables,
	FETCH_INTERFACE_FIELDS,
	FETCH_JSON_HEADERS,
	getFetchInterfaceVariableOptions,
} from './fetchInterfaceCreate';


import * as gql from 'gql-query-builder-ts';


type JSONResponse = {
	data?: unknown;
	errors?: {message: string}[];
}


interface FetchInterfaceUpdateParams {
	url: string;
	variables: FetchInterfaceVariables & {
		_id: string;
	}
	handleData?: (data: unknown) => void
	handleResponse?: (response: Response) => void
}

export function fetchInterfaceUpdate({
	url,
	//variables,
	variables: {
		_id,
		_name,
		collectionIds = [],
		expressions,
		fields = [],
		//stopWordIds = [],
		stopWords = [],
		synonymIds = [],
		termQueries = [],
	},
	handleData = (data) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug('fetchInterfaceUpdate(',{url, variables:{
			_name, collectionIds,fields, stopWords,synonymIds
		}},') --> data:', data);

	},
	handleResponse = (response) => {
		//console.debug('fetchInterfaceUpdate({url:', url, ', variables:', variables, '}) --> response:', response);
		handleData((response.json()as JSONResponse).data);
	}
}: FetchInterfaceUpdateParams) {
	//console.debug('fetchInterfaceUpdate({url:', url, ', variables:', variables, '})');
	fetch(url, {
		method: 'POST',
		headers: FETCH_JSON_HEADERS,
		body: JSON.stringify(gql.mutation({
			operation: 'updateInterface',
			variables: {
				_id: {
					list: false,
					required: true,
					type: 'ID',
					value: _id
				},
				...getFetchInterfaceVariableOptions({
					_name,
					collectionIds,
					expressions,
					fields,
					stopWords,
					synonymIds,
					termQueries,
				})
			}, // variables
			fields: FETCH_INTERFACE_FIELDS
		}))
	})
		.then(response => handleResponse(response));
}

/* Example query variables:
{
	"_id": "",
	"_name": "a",
	"collectionIds": "556e04a5-dbb5-4db4-92c1-afb2fc031e2b",
	"fields": {
		"boost": 3,
		"name": "extra"
	},
	"stopWordIds": "ecbaf718-acf7-4ef7-869e-86afa1ab33d7",
	"synonymIds": "3b46ba9f-e8bd-4639-b1ac-d33911b9c1cf",
	"termQueries": {
		boost: 1.1,
		field: 'field',
		type: 'string',
		booleanValue: true,
		doubleValue: 1.1,
		longValue: 1,
		stringValue: 'stringValue'
	}
}
*/
