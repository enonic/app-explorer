import type {
	Collection,
	DocumentType,
	Interface
} from '/lib/explorer/types/index.d';
//import type {JSONResponse}  from './index.d';


import {GQL_QUERY_DOCUMENT_TYPES_QUERY} from '../queries/documentTypesQuery';


export type QueryDocumentTypesHit = DocumentType & {
	_referencedBy :{
		count :number
		hits :Array<Collection & {
			_hasField :{
				total :number
			}
			_referencedBy :{
				count :number
				hits :Array<Interface>
				total :number
			}
		}>
		total :number
	}
};

export type QueryDocumentTypesHits = Array<QueryDocumentTypesHit>;

export type FetchQueryDocumentTypesData = {
	queryDocumentTypes :{
		count :number
		hits :QueryDocumentTypesHits
		total :number
	}
}


export function fetchDocumentTypes({
	url,
	handleData = () => {/**/},
} :{
	handleData :(data :FetchQueryDocumentTypesData) => void
	url :string,
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
