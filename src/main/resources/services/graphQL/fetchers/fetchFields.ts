import type {
	Collection,
	DocumentType,
	Field
} from '/lib/explorer/types/index.d';
import type {JSONResponse} from './index.d';


import {GQL_QUERY_FIELDS_QUERY} from '../queries/fieldsQuery';


export type QueryFieldsResult = {
	count :number
	hits :Array<Field & {
		_referencedBy :{
			count :number
			hits :Array<DocumentType & {
				_referencedBy :{
					count :number
					hits :Array<Collection & {
						_hasField :{
							total :number
						}
					}>
					total :number
				}
			}>
			total :number
		}
	}>
	total :number
}

export type FetchFieldsData = {
	queryFields :QueryFieldsResult
}


export function fetchFields({
	url,
	variables: {
		includeSystemFields = false
	} = {},
	handleData = () => {},
} :{
	handleData :(data :FetchFieldsData) => void
	url :string,
	variables ?:{
		includeSystemFields ?:boolean
	}
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: GQL_QUERY_FIELDS_QUERY,
			variables: {
				includeSystemFields
			}
		})
	})
		.then(response => response.json() as JSONResponse<FetchFieldsData>)
		.then(jsonObj => {
			//console.debug('fetchFields jsonObj', jsonObj);
			handleData(jsonObj.data);
		});
}
