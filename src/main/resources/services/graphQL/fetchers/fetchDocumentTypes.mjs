import {GQL_QUERY_DOCUMENT_TYPES_QUERY} from '../queries/documentTypesQuery.mjs';


export function fetchDocumentTypes({
	handleData = () => {},
	url
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_DOCUMENT_TYPES_QUERY
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('json', json);
			handleData(json.data);
		});
}
