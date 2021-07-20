//import {toStr} from '@enonic/js-utils';

//──────────────────────────────────────────────────────────────────────────────
// Local libs (Absolute path without extension so it doesn't get webpacked)
//──────────────────────────────────────────────────────────────────────────────
import {search} from '/lib/explorer/client';
import {jsonError} from '/lib/explorer/jsonError';
import {jsonResponse} from '/lib/explorer/jsonResponse';


export function get({params}) {
	//log.info(toStr({params}));
	if (!params.interface) { return jsonError('Required param interface missing!'); }
	return jsonResponse(search(params));
} // function get
