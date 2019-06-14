import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
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
		contentType: RT_JSON
	};
}
