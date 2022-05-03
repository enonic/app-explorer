import {GQL_MUTATION_INTERFACE_DELETE} from '../mutations/interfaceDeleteMutation';


export function fetchInterfaceDelete({
	url,
	variables: {
		_id
	},
	handleResponse = (response :Response) => {
		// This will only be called if handleResponse is passed in...
		console.debug(
			'fetchInterfaceDelete(',{
				url,
				variables: {
					_id
				}
			},') handleResponse() --> response:',
			response
		);
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
