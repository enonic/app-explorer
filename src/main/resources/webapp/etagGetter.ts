import type { Request } from '../types/index.d';
import type { Response } from '@enonic-types/lib-explorer';

import {
	RESPONSE_CACHE_CONTROL,
	mappedRelativePath,
	requestHandler
} from '/lib/enonic/static';
import {DOCUMENT_REST_API_PATH} from './constants';


const etagGetter = (request) => requestHandler(
	request,
	{
		cacheControl: () => RESPONSE_CACHE_CONTROL.SAFE,
		contentType: ({
			path,
			// resource,
		}) => {
			if (
				path.substring(path.length - 3) === '.js'
				|| path.substring(path.length - 4) === '.mjs'
			) {
				return 'text/javascript';
			} else if (path.substring(path.length - 4) === '.css') {
				return 'text/css';
			} else if (path.substring(path.length - 6) === '.woff2') {
				return 'font/woff';
			} else if (path.substring(path.length - 5) === '.woff') {
				return 'font/woff';
			} else if (path.substring(path.length - 4) === '.ttf') {
				return 'font/ttf';
			}
			return 'octet/stream';
		},
		index: false,
		relativePath: mappedRelativePath(`${DOCUMENT_REST_API_PATH}/static`),
	}) as ((_request: Request) => Response);


export default etagGetter;
