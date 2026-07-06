import type { Request, Response } from '@enonic-types/core';


import {
	mappedRelativePath,
	requestHandler,
} from '/lib/enonic/static';


export const immutableGetter = (request: Request): Response => requestHandler(
	request,
	{
		etag: false, // default is true in production and false in development
		index: false,
		relativePath: mappedRelativePath('static'),
	});


export default immutableGetter;
