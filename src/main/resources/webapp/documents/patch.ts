import type { Request } from '../../types/Request';


// import { toStr } from '@enonic/js-utils/value/toStr';
import put from './put';


export type PatchRequest = Request<{
	collection?: string
	id?: string
	requireValid?: 'true' | 'false'
	returnDocument?: 'true' | 'false'
	returnMetadata?: 'true' | 'false'
},{
	collectionName?: string
	documentId?: string
}>;


export default function patch(request: PatchRequest) {
    // log.debug('patch request:%s', toStr(request));
    const {
        method
    } = request
    return put(request, true);
}
