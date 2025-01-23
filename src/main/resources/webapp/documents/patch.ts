import type { Request } from '@enonic-types/core';


// import { toStr } from '@enonic/js-utils/value/toStr';
import put from './put';


export type PatchRequest = Request<{
	params: {
		collection?: string
		id?: string
		requireValid?: 'true' | 'false'
		returnDocument?: 'true' | 'false'
	}
}> & {
	pathParams: {
		collectionName?: string
		documentId?: string
	}
};


export default function patch(request: PatchRequest) {
	// log.debug('patch request:%s', toStr(request));
	const {
		method
	} = request
	return put(request, true);
}
