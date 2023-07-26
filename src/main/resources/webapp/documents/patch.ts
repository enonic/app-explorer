import type { Request } from '../../types/Request';


// import { toStr } from '@enonic/js-utils/value/toStr';
import put from './put';


export default function patch(request: Request<{
    collection?: string
    id?: string
    requireValid?: 'true' | 'false'
},{
    collectionName?: string
    documentId?: string
}>) {
    // log.debug('patch request:%s', toStr(request));
    const {
        method
    } = request
    return put(request, true);
}