import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';



exports.delete = ({
	params: {
		name
	}
}) => {
	const connection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
	const removeRes = remove({
		connection,
		_parentPath: '/collections',
		_name: name
	});
	let body = {
		message: `Deleted collection ${name}`
	}
	let status = 200;
	if (!removeRes) {
		body = {
			error: `Failed to delete collection ${name}!`
		}
		status = 400;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}
