import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';


exports.delete = ({
	params: {
		id,
		name
	}
}) => {
	const deleteRes = remove({
		connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		}),
		//_id: id,
		//_name: name
		key: id
	});
	const body = {};
	let status = 200;
	if (deleteRes.length) {
		body.message = `Deleted thesaurus ${name}`;
	} else {
		body.error = `Something went wrong when trying to delete thesaurus ${name}!`;
		status = 500;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
} // exports.delete
