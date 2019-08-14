import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';

import {connect} from '/lib/explorer/repo/connect';


exports.delete = ({
	params: {
		name
	}
}) => {
	const path = `/fields/${name}`;
	const deleteRes = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	}).delete(path);

	let body = {
		message: `Field with path:${path} deleted.`
	};
	let status = 200;
	if (!deleteRes.length) {
		body = {
			error: `Something went wrong when trying to delete field with path:${path}.`
		};
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}; // delete
