import type { Request } from '@enonic-types/core';


// import {toStr} from '@enonic/js-utils/value/toStr';
import {
	FILEPATH_MANIFEST,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '../constants';
import webappUrl from './webappUrl';
import {jsonParseResource} from '../lib/app/explorer/jsonParseResource';


const manifests = {
	[FILEPATH_MANIFEST]: jsonParseResource(FILEPATH_MANIFEST),
	[FILEPATH_MANIFEST_NODE_MODULES]: jsonParseResource(FILEPATH_MANIFEST_NODE_MODULES),
}


export default function getImmuteableUrl({
	manifestPath = FILEPATH_MANIFEST,
	path,
	request
}: {
	manifestPath?: string
	path: string,
	request: Request
}) {
	// log.info('getImmuteableUrl manifestPath:%s path:%s', manifestPath, path);
	manifests[manifestPath] = jsonParseResource(manifestPath);
	return webappUrl({
		path: `${GETTER_ROOT}/${manifests[manifestPath][path]}`,
		request
	});
}
