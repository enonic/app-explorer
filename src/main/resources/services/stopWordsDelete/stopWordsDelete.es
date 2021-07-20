//import {toStr} from '@enonic/js-utils';

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
	//log.info(`name:${name}`);
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const nodePath = `/stopwords/${name}`;
	//log.info(`nodePath:${nodePath}`);

	const deleteRes = remove({connection, path: nodePath});
	//log.info(`deleteRes:${toStr(deleteRes)}`);

	const body = {};
	let status = 200;
	if (deleteRes) {
		body.message = `StopWords named:${name} succesfully deleted`;
	} else {
		status = 500;
		body.error = `Something went wrong when trying to delete stopwords named ${name}!`;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}; // delete
