import type {AnyObject} from '../../../types/index.d';


import {GQL_QUERY_HAS_FIELD} from '../queries/hasField';


export function fetchHasField({
	url,
	variables: {
		collections = [],
		count = 0,
		field,
		filters = {}
	},
	handleData = (data) => {
		// This will only be called if handleData is passed in...
		console.debug(
			'fetchHasField(',{
				url,
				variables: {
					collections,
					count,
					field,
					filters
				}
			},') handleData() --> data:',
			data
		);
	}
} :{
	handleData: (data :unknown) => void
	url :string
	variables :{
		collections ?:Array<string>
		count ?:number
		field :string
		filters :AnyObject
	}
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
