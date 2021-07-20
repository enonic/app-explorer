//import {toStr} from '@enonic/js-utils';

import {
	//NT_API_KEY,
	PATH_API_KEYS,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';


exports.delete = ({
	params: {
		name
	}
}) => {
	let body = {};
	let status = 200;
	if (!name) {
		body.error = 'Name cannot be empty!';
		status = 400;
	} else {
		const nodePath = `${PATH_API_KEYS}/${name}`;
		//log.info(`nodePath:${toStr(nodePath)}`);
		try {
			const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
			const deleteRes = writeConnection.delete(nodePath);
			//log.info(`deleteRes:${toStr(deleteRes)}`);
			if (deleteRes) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				body.message = `Deleted API Key ${name}`;
			} else {
				throw new Error(`Something went wrong when trying to delete API Key ${name}`);
			}
		} catch (e) {
			log.error('e:', e);
			body.error = `Something went wrong when trying to delete API Key ${name}`;
			status = 500;
		}
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
};
