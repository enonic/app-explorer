import {GQL_QUERY_QUERY_DOCUMENT_TYPES} from '../../../services/graphQL/documentType/queryQueryDocumentTypes.es';


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
			query: GQL_QUERY_QUERY_DOCUMENT_TYPES
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('json', json);
			handleData(json.data);
		});
}
