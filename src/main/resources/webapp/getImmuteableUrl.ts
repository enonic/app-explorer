import type { Request } from '../types/Request';


// import {toStr} from '@enonic/js-utils/value/toStr';
import {
	getResource,
	readText
} from '/lib/xp/io';
import {
	FILEPATH_MANIFEST,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '../constants';
import webappUrl from './webappUrl';


function readResource(filename: string) {
	const resource = getResource(filename);
	if (!resource || !resource.exists()) {
		throw new Error(`Empty or not found: ${filename}`);
	}
	let content: string;
	try {
		content = readText(resource.getStream());
		// log.debug('readResource: filename:%s content:%s', filename, content);
	} catch (e) {
		log.error(e.message);
		throw new Error(`Couldn't read resource: ${filename}`);
	}
	return content;
}


function jsonParseResource(filename: string) {
	const content = readResource(filename);
	let obj: object;
	try {
		obj = JSON.parse(content);
		// log.debug('jsonParseResource obj:%s', toStr(obj));
	} catch (e) {
		log.error(e.message);
		log.info("Content dump from '" + filename + "':\n" + content);
		throw new Error(`couldn't parse as JSON content of resource: ${filename}`);
	}
	return obj;
}


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
