import type {
	Request,
	Response,
} from '@enonic-types/core';

import {
	mappedRelativePath,
	requestHandler,
} from '/lib/enonic/static';


export const immutableGetter = (request: Request) => requestHandler(
	request,
	{
		etag: false, // default is true in production and false in development
		index: false,
		relativePath: mappedRelativePath('static'),
	}) as (_request: Request) => Response;


export default immutableGetter;
