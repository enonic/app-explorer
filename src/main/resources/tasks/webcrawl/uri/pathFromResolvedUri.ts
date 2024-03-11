import {normalizeUriObj} from './normalizeUriObj';


export function pathFromResolvedUri(resolvedUri: string): string {
	return normalizeUriObj(resolvedUri).path;
}
