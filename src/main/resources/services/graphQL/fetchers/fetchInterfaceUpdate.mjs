import {GQL_MUTATION_INTERFACE_UPDATE} from '../mutations/interfaceUpdateMutation.mjs';


export function fetchInterfaceUpdate({
	handleData = (data) => {
		console.debug('data', data);
	},
	handleResponse = (response) => {
		console.debug('response', response);
		handleData(response.json().data);
	},
	url,
	variables: {
		_id,
		_name,
		collectionIds = [],
		fields = [],
		//stopWordIds = [],
		stopWords = [],
		//synonymIds = []
		synonyms = []
	} = {}
}) {
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
				//synonymIds
				synonyms
			}
		})
	})
		.then(response => handleResponse(response));
}
