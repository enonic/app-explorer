// import {toStr} from '@enonic/js-utils';
import {
	getResource,
	readText
} from '/lib/xp/io';
import {
	FILEPATH_MANIFEST,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
	SERVICE_NAME,
} from './constants';
import {jsonParseResource} from '../../lib/app/explorer/jsonParseResource';


const manifests = {
	[FILEPATH_MANIFEST]: jsonParseResource(FILEPATH_MANIFEST),
	[FILEPATH_MANIFEST_NODE_MODULES]: jsonParseResource(FILEPATH_MANIFEST_NODE_MODULES),
}


export default function getImmuteableUrl({
	manifestPath = FILEPATH_MANIFEST,
	path,
}: {
	manifestPath?: string
	path: string,
}) {
	manifests[manifestPath] = jsonParseResource(manifestPath);
	return `${SERVICE_NAME}/${GETTER_ROOT}/${manifests[manifestPath][path]}`;
}
