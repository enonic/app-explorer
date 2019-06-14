import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/interface/remove';


export function post({
	params: {
		name
	}
}) {
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });

	const res = remove({
		connection,
		name
	});

	return {
		body: res,
		contentType: RT_JSON,
		status: res.length ? 200 : 500
	};
}
