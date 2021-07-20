//import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';


exports.delete = ({
	params: {
		id
	}
}) => {
	const body = {};
	let status = 200;
	try {
		//log.info(`synonymDelete id:${id}`);
		if(!id) throw new Error(`Missing required param id!`);
		const deleteRes = remove({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			}),
			path: id
		});
		if (!deleteRes) {
			throw new Error(`Something went wrong when trying to delete synonym id:${id}!`);
		}
		body.message=`Deleted synonym id:${id}`;
	} catch (e) {
		body.error=e.message;
		status=500;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
}; // delete
