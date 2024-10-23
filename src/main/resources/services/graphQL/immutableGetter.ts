import type { Request } from '../../types/index.d';
import type { Response } from '@enonic-types/lib-explorer';

import {
	mappedRelativePath,
	requestHandler,
} from '/lib/enonic/static';


export const immutableGetter = (request) => requestHandler(
	request,
	{
		etag: false, // default is true in production and false in development
		index: false,
		relativePath: mappedRelativePath('static'),
	}) as (_request: Request) => Response;


export default immutableGetter;
