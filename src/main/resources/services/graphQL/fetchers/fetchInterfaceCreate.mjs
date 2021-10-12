import {GQL_MUTATION_INTERFACE_CREATE} from '../mutations/interfaceCreateMutation.mjs';


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
		handleData(response.json().data);
	}
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
