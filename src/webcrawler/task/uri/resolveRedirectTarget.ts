import {resolve} from 'uri-js';
import {normalizeUriObj} from './normalizeUriObj';
import {serializeNormalizedUriObjWithQuery} from './serializeNormalizedUriObjWithQuery';


export interface RedirectTarget {
	host: string
	resolvedUrl: string
	normalizedUrl: string
	sameDomain: boolean
}

export function resolveRedirectTarget(currentUrl: string, location: string, domain: string): RedirectTarget {
	const resolvedUrl = resolve(currentUrl, location);
	const normalizedUriObj = normalizeUriObj(resolvedUrl);
	return {
		host: normalizedUriObj.host,
		resolvedUrl,
		normalizedUrl: serializeNormalizedUriObjWithQuery(normalizedUriObj),
		sameDomain: normalizedUriObj.host === domain,
	};
}
