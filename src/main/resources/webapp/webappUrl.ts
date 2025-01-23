import type { Request } from '@enonic-types/core';


// import {toStr} from '@enonic/js-utils/value/toStr';
import {
	isEnabled as vhostsEnabled,
	list as getVhosts
} from '/lib/xp/vhost';
import {DOCUMENT_REST_API_PATH} from './constants';


export default function webappUrl({
	path,
	request
}: {
	path?: string
	request: Request
}) {
	// log.info('webappUrl path:%s', path);

	const {
		host: requestHost, // can be used to match vhost.host
		path: requestPath, // can be used to match vhost.source
		rawPath: requestRawPath, // can be used to match vhost.target
	} = request;

	const {vhosts} = getVhosts();
	// log.info('webappUrl vhosts:%s', toStr(vhosts));

	const webappVhost = vhosts.filter(({
		host,
		source,
		// target
	}) => host === requestHost
		&& requestPath.startsWith(source)
		// && requestRawPath.startsWith(target)
		// && target.startsWith('/webapp')
	)[0];
	// log.info('webappUrl host:%s requestPath:%s requestRawPath:%s webappVhost:%s', requestHost, requestPath, requestRawPath, toStr(webappVhost));

	const base = vhostsEnabled() && webappVhost
		? webappVhost.source
		: `/webapp/${app.name}${DOCUMENT_REST_API_PATH}`;

	return path ? `${base}/${path}` : base;
}
