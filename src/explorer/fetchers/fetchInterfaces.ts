import {GQL_QUERY_INTERFACE} from '../queries/interfaceQuery';


export function fetchInterfaces({
	url,
	variables: {
		count = -1
	} = {},
	handleData = (data :unknown) => {
		// This will only be called if handleData is passed in...
		console.debug(
			'fetchInterfaces(',{
				url,
				variables: {
					count
				}
			},') handleData() --> data:',
			data
		);
	}
}) {
	fetch(url, {
		method: 'POST',
		headers: { // HTTP/2 uses lowercase header keys
			'content-type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_INTERFACE,
			variables: {
				count
			}
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('json', json);
			handleData(json.data);
		});
}
