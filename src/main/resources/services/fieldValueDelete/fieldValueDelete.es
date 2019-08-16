import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {remove} from '/lib/explorer/node/remove';
import {connect} from '/lib/explorer/repo/connect';


exports.delete = ({params: {
	field,
	value
}}) => {
	const deleteRes = remove({
		connection: connect({principals: PRINCIPAL_EXPLORER_WRITE}),
		path: `/fields/${field}/${value}`
	});

	let body = {
		message: `Value ${value} for field ${field} deleted.`
	};
	let status = 200;

	if (!deleteRes.length) {
		body = {
			error: `Something went wrong when trying to delete value ${value} for field ${field}.`
		}
		status = 500;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
};
