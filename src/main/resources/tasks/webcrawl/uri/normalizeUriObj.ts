import endsWith from '@enonic/js-utils/string/endsWith';
import {URIComponents, normalize, parse} from 'uri-js';


// NOTE: This returned object should not be serialized as that adds a trailing slash again!
export function normalizeUriObj(uri: string): URIComponents {
	const uriObj = parse(normalize(uri));
	// We can always strip the fragment since fragments only exists client-side
	// and should cause new requests
	delete uriObj.fragment;
	// We cannot always strip query, for instance when paginating search result
	// pages.
	// delete uriObj.query;
	if (endsWith(uriObj.path, '/')) {
		uriObj.path = uriObj.path.substring(0, uriObj.path.length - 1);
	}
	return uriObj;
}
