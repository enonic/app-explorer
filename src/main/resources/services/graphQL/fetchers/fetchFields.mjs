import {GQL_QUERY_QUERY_FIELDS} from '../queries/fieldsQuery.mjs';


export function fetchFields({
	handleData = () => {},
	url,
	variables: {
		includeSystemFields
	} = {}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_QUERY_FIELDS,
			variables: {
				includeSystemFields
			}
		})
	})
		.then(response => response.json())
		.then(jsonObj => {
			//console.debug('fetchFields jsonObj', jsonObj);
			handleData(jsonObj.data);
		});
}
