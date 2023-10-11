import type { Request } from '../types/index.d';
import type { Response } from '@enonic-types/lib-explorer';


// import { toStr } from '@enonic/js-utils/value/toStr';
// @ts-expect-error TS2307: Cannot find module '/lib/enonic/static' or its corresponding type declarations.
import { buildGetter } from '/lib/enonic/static';
import { GETTER_ROOT } from '../constants';
import {DOCUMENT_REST_API_PATH} from './constants';


// const LOG_LEVEL = 'debug';


const etagGetter = buildGetter({
	cacheControl: 'no-cache', // implies must-revalidate after 0 seconds
	etag: true, // default is true in production and false in development
	getCleanPath: (request: Request) => {
		// log[LOG_LEVEL]('etagGetter request:%s', toStr(request));
		// log[LOG_LEVEL]('etagGetter contextPath:%s', request.contextPath);
		// log[LOG_LEVEL]('etagGetter rawPath:%s', request.rawPath);

		const prefix = request.contextPath;

		let cleanPath = prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
		// log[LOG_LEVEL]('etagGetter cleanPath:%s', cleanPath);

		// cleanPath = cleanPath.replace(`${DOCUMENT_REST_API_PATH}/${GETTER_ROOT}/`, '');
		cleanPath = cleanPath.replace(`${DOCUMENT_REST_API_PATH}/`, '');
		// log[LOG_LEVEL]('etagGetter cleanPath:%s', cleanPath);

		return cleanPath;
	},
	root: GETTER_ROOT
}) as (_request: Request) => Response;


export default etagGetter;
