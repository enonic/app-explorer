import type {InterfaceField} from '/lib/explorer/types/index.d';


import {GQL_MUTATION_INTERFACE_CREATE} from '../mutations/interfaceCreateMutation';


type JSONResponse = {
	data? :unknown
	errors?: Array<{message: string}>
}


export function fetchInterfaceCreate({
	url,
	//variables,
	variables: {
		_name,
		collectionIds = [],
		fields = [],
		//stopWordIds = [],
		stopWords = [],
		synonymIds = []
	} = {},
	handleData = (data) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug('fetchInterfaceCreate(',{url, variables:{
			_name, collectionIds,fields, stopWords,synonymIds
		}},') --> data:', data);
	},
	handleResponse = (response) => {
		//console.debug('fetchInterfaceCreate({url:', url, ', variables:', variables, '}) --> response:', response);
		handleData((response.json() as JSONResponse).data);
	}
} :{
	url :string
	variables :{
		_name? :string
		collectionIds? :Array<string>
		fields? :Array<InterfaceField>
		stopWords? :Array<string>
		synonymIds? :Array<string>
	}
	handleData? :(data :unknown) => void
	handleResponse? :(response :Response) => void
}) {
	//console.debug('fetchInterfaceCreate({url:', url, ', variables:', variables, '})');
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_INTERFACE_CREATE,
			variables: {
				_name,
				collectionIds,
				fields,
				//stopWordIds,
				stopWords,
				synonymIds
			}
		})
	})
		.then(response => handleResponse(response));
}
