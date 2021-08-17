/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import {get} from './get';
import {post} from './post';
import {remove} from './remove';

export function all(request) {
	//log.info(`request:${toStr(request)}`);

	const {
		method
	} = request;
	//log.info(`method:${toStr(method)}`);

	if (method === 'GET') {
		return get(request);
	} // method === 'GET'

	if (method === 'POST') {
		return post(request);
	} // method === 'POST'

	if (method === 'DELETE') {
		return remove(request);
	} // method === 'DELETE'

	return {
		status: 405 // Method not allowed
	};
}
