import {getInterfaceQuery} from '../queries/getInterfaceQuery.mjs';


export function fetchInterfaceGet({
	handleData = () => {},
	url,
	variables: {
		_id
	} = {}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: getInterfaceQuery({_id})
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('json', json);
			handleData(json.data);
		});
}
