import {GQL_MUTATION_INTERFACE_UPDATE} from '../mutations/interfaceUpdateMutation.mjs';


export function fetchInterfaceUpdate({
	url,
	//variables,
	variables: {
		_id,
		_name,
		collectionIds = [],
		fields = [],
		//stopWordIds = [],
		stopWords = [],
		synonymIds = []
	} = {},
	handleData = (data) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug('fetchInterfaceUpdate(',{url, variables:{
			_name, collectionIds,fields, stopWords,synonymIds
		}},') --> data:', data);

	},
	handleResponse = (response) => {
		//console.debug('fetchInterfaceUpdate({url:', url, ', variables:', variables, '}) --> response:', response);
		handleData(response.json().data);
	}
}) {
	//console.debug('fetchInterfaceUpdate({url:', url, ', variables:', variables, '})');
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_INTERFACE_UPDATE,
			variables: {
				_id,
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
