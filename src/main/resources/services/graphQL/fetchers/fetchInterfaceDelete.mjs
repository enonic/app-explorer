import {GQL_MUTATION_INTERFACE_DELETE} from '../mutations/interfaceDeleteMutation.mjs';


export function fetchInterfaceDelete({
	handleResponse = () => {},
	url,
	variables: {
		_id
	}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_MUTATION_INTERFACE_DELETE,
			variables: {
				_id
			}
		})
	})
		.then(response => handleResponse(response));
}
