import type {AnyObject} from '../../../types/index.d';


import {GQL_QUERY_FIELDS_QUERY} from '../queries/fieldsQuery';


export function fetchFields({
	url,
	variables: {
		includeSystemFields = false
	} = {},
	handleData = () => {},
} :{
	handleData :(data :AnyObject) => void
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
		.then(response => response.json())
		.then(jsonObj => {
			//console.debug('fetchFields jsonObj', jsonObj);
			handleData(jsonObj.data);
		});
}
