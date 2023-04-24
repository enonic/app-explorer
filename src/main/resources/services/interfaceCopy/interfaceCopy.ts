import { Principal } from '@enonic/explorer-utils';
import {RESPONSE_TYPE_JSON} from '@enonic/js-utils';
import {connect} from '/lib/explorer/repo/connect';
import {copy} from '/lib/explorer/interface/copy';


export function get({
	params: {
		from,
		to
	}
}) {
	try {
		copy({
			connection: connect({
				principals: [Principal.EXPLORER_WRITE]
			}),
			from,
			to
		});
		return {
			body: {
				from,
				to
			},
			contentType: RESPONSE_TYPE_JSON
		}
	} catch (e) {
		return {
			body: {
				message: e.message
			},
			contentType: RESPONSE_TYPE_JSON,
			status: 500
		}
	}
}
