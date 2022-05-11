import {RESPONSE_TYPE_JSON} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {connect} from '/lib/explorer/repo/connect';


export function get({
	params: {
		name
	}
}) {
	return {
		body: {
			exists: exists({
				connection: connect({principals: [PRINCIPAL_EXPLORER_READ]}),
				name
			})
		},
		contentType: RESPONSE_TYPE_JSON
	};
}
