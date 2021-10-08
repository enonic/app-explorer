import {GQL_QUERY_INTERFACE} from '../queries/interfaceQuery.mjs';


export function fetchInterfaces({
	handleData = () => {},
	url,
	variables: {
		count = -1
	} = {}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
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
