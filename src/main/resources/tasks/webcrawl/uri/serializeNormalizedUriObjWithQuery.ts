import type {URIComponents} from 'uri-js';
import {canonizeNormalizedUriObj} from './canonizeNormalizedUriObj';


// We cannot always strip query, for instance when paginating search result pages.
export function serializeNormalizedUriObjWithQuery(normalizedUriObj: URIComponents ): string {
	const {query} = normalizedUriObj;
	return `${canonizeNormalizedUriObj(normalizedUriObj)}${query ? `?${query}` : ''}`;
}
