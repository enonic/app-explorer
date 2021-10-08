import {GQL_MUTATION_INTERFACE_CREATE} from '../mutations/interfaceCreateMutation.mjs';


export function fetchInterfaceCreate({
	handleData = (data) => {
		console.debug('data', data);
	},
	handleResponse = (response) => {
		console.debug('response', response);
		handleData(response.json().data);
	},
	url,
	variables: {
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
			query: GQL_MUTATION_INTERFACE_CREATE,
			variables: {
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
