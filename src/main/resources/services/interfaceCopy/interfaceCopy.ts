import {RESPONSE_TYPE_JSON} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/constants';
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
				principals: [PRINCIPAL_EXPLORER_WRITE]
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
