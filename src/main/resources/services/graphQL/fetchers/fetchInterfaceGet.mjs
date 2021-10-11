//import {toStr} from '@enonic/js-utils';

import {getInterfaceQuery} from '../queries/getInterfaceQuery.mjs';


export function fetchInterfaceGet({
	handleData = () => {},
	url,
	variables: {
		_id
	} = {}
}) {
	//console.debug('fetchInterfaceGet({url:', url, ', _id:', _id, '})');
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: `{${getInterfaceQuery({_id})}}`
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('fetchInterfaceGet({url:', url, ', _id:', _id, '}) --> json', json);
			handleData(json.data);
		});
}
