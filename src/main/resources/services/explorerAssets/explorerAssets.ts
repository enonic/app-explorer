import type {Controller} from '../../../../../../xp-comlock-9742/modules/lib/core/index';

import endsWith from '@enonic/js-utils/string/endsWith';
import {requestHandler} from '/lib/enonic/static';
// @ts-expect-error no types
import Router from '/lib/router';
import {jsonParseResource} from '../../lib/app/explorer/jsonParseResource';


const SERVICE_NAME = 'explorerAssets';
const FILEPATH_MANIFEST_NODE_MODULES = `/services/${SERVICE_NAME}/files/node_modules_manifest.json`;
const MANIFEST = jsonParseResource(FILEPATH_MANIFEST_NODE_MODULES);


const router = Router();

router.all('{path:.*}', (request) => requestHandler(request, {
	contentType: ({path}) => {
		if (endsWith(path, '.js') || endsWith(path, '.mjs')) {
			return 'application/javascript';

		} else if (endsWith(path, '.css')) {
			return 'text/css';

		} else if (endsWith(path, '.ico')) {
			return 'image/x-icon';

		} else if (endsWith(path, '.woff2')) {
			return 'font/woff2';
		} else if (endsWith(path, '.woff')) {
			return 'font/woff';
		} else if (endsWith(path, '.ttf')) {
			return 'font/ttf';
		} else if (endsWith(path, '.eot')) {
			return 'application/vnd.ms-fontobject';

		} else if (endsWith(path, '.svg')) {
			return 'image/svg+xml';

		} else if (endsWith(path, '.json')) {
			return 'application/json';

		} else {
			return 'octet/stream';
		}
	},
	index: false,
	notFound: ({
		cacheControl,
		contentType,
		etag,
		index,
		request,
		root,
		staticCompress,
		throwErrors,
	}) => {
		return requestHandler(
			request,
			{
				cacheControl,
				contentType,
				etag,
				index,
				relativePath: (request) => {
					const {
						contextPath,
						rawPath
					} = request;
					const relPath = rawPath.substring(contextPath.length + 1); // +1 to remove leading '/'
					const pathWithHash = MANIFEST[relPath];
					if (!pathWithHash && !endsWith(relPath, '.map')) {
						const msg = `No pathWithHash found for relPath:${relPath}`;
						log.error(msg);
						if (throwErrors) {
							throw new Error(msg);
						}
						return undefined;
					} else {
						// log.debug('relPath:%s pathWithHash:%s', relPath, pathWithHash);
						return `/${pathWithHash}`; // Re-add leading '/'
					}
				},
				root,
				staticCompress,
				throwErrors,
			},
		);
	},
	root: '/services/explorerAssets/files',
}));

const controller: Controller = {
	all: (request) => router.dispatch(request),
}

export default controller; // Also needed, or else Enonic XP 7.x Nashorn will not work.
module.exports = controller; // Needed to work in Enonic XP 7.x (Nashorn)
