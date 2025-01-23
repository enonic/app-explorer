import type {
	Controller,
	Request,
	ResourceKey
} from '@enonic-types/core';

import lcKeys from '@enonic/js-utils/object/lcKeys';
import {startsWith} from '@enonic/js-utils/string/startsWith';
// @ts-expect-error no types
import Router from '/lib/router';
import {getResource} from '/lib/xp/io';


const appHelper = __.newBean<{
	toResourceKey(resourceUri: string): ResourceKey
}>('com.enonic.app.explorer.AppHelper');

const etagService = __.newBean<{
	getEtag: (path: string, etagOverride?: number) => Record<string,string>
}>('com.enonic.app.explorer.etag.EtagService');

const getEtag = ({
	appName,
	path,
}: {
	appName: string
	path: string
}): string|undefined => {
	const {error, etag} = __.toNativeObject(etagService.getEtag(`${appName}:${path}`));

	if (error) {
		throw Error(error);
	}

	return etag || undefined
};

function getLowerCasedHeaders({
	request,
}: {
	request: Request
}): object {
	const {
		headers: mixedCaseRequestHeaders = {},
	} = request;

	return lcKeys(mixedCaseRequestHeaders);
}

const router = Router();

router.all('{path:.*}', (request: Request) => {
	// log.info('request:%s', JSON.stringify(request, null, 4));
	const {path, contextPath} = request;
	if (!startsWith(path, contextPath)) {
		throw new Error('collectorAssets service: Request path does not start with contextPath!');
	}
	const relPath = path.substring(contextPath.length + 1);
	// log.info('relPath:%s', relPath);

	const parts = relPath.split('/');
	const appName = parts.shift();
	const assetRelPath = parts.join('/');
	// log.info('appName:%s assetRelPath:%s', appName, assetRelPath);

	const assetAbsPath =`/assets/${assetRelPath}`;
	// log.info('assetAbsPath:%s', assetAbsPath);

	const resource = getResource(appHelper.toResourceKey(`${appName}:${assetAbsPath}`));
	if (!resource.exists()) {
		return {
			status: 404
		};
	}

	const headers: Request['headers'] = {
		'cache-control': 'public, max-age=10, s-maxage=3600, stale-while-revalidate=50'
	};

	const etagWithDblFnutts = getEtag({
		appName,
		path: assetAbsPath
	});
	if (etagWithDblFnutts) {
		headers['etag'] = etagWithDblFnutts;
		const lowerCasedRequestHeaders = getLowerCasedHeaders({request});
		const ifNoneMatchRequestHeader = lowerCasedRequestHeaders['if-none-match'];
		if (
			ifNoneMatchRequestHeader
			&& ifNoneMatchRequestHeader === etagWithDblFnutts
		) {
			return {
				headers,
				status: 304,
			};
		}
	}

	return {
		body: resource.getStream(),
		contentType: 'text/javascript',
		headers,
		status: 200
	};
});

const controller: Controller = {
	all: (request) => router.dispatch(request),
}

export default controller; // Also needed, or else Enonic XP 7.x Nashorn will not work.
module.exports = controller; // Needed to work in Enonic XP 7.x (Nashorn)
