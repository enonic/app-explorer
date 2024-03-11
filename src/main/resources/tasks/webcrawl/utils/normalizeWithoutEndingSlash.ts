import endsWith from '@enonic/js-utils/string/endsWith';
import {parse} from 'uri-js';
// import {parseUrl} from './parseUrl';


export function normalizeWithoutEndingSlash(url: string): string {
	let {
		scheme,
		host,
		port,
		path,
	} = parse(url);
	if (endsWith(path, '/')) {
		path = path.substring(0, path.length - 1);
	}
	return `${scheme}://${host}${port ? `:${port}` : ''}${path}`;
}
