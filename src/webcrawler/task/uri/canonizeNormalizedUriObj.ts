import type {URIComponents} from 'uri-js';


export function canonizeNormalizedUriObj(normalizedUriObj: URIComponents ): string {
	let {
		scheme,
		host,
		port,
		path,
	} = normalizedUriObj;
	return `${scheme}://${host}${port ? `:${port}` : ''}${path}`;
}
