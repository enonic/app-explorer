import {normalizeUriObj} from './normalizeUriObj';
import {serializeNormalizedUriObjWithQuery} from './serializeNormalizedUriObjWithQuery';


export function normalizeWithoutEndingSlash(uri: string): string {
	return serializeNormalizedUriObjWithQuery(normalizeUriObj(uri));
}
