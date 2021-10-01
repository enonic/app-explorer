import {GQL_QUERY_HAS_FIELD} from '../queries/hasField.mjs';


export function fetchHasField({
	handleData = () => {},
	url,
	variables: {
		collections = [],
		count = 0,
		field,
		filters = {}
	} = {}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_HAS_FIELD,
			variables: {
				collections,
				count,
				field,
				filters
			}
		})
	})
		.then(response => response.json())
		.then(jsonObj => {
			//console.debug('fetchFields jsonObj', jsonObj);
			handleData(jsonObj.data);
		});
}
