import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {modify} from '/lib/explorer/node/modify';
import {thesaurus} from '/lib/explorer/model/2/nodeTypes/thesaurus';


export function post({
	params: {
		displayName,
		name
	}
}) {
	const createRes = modify(thesaurus({
		__connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		}),
		_name: name,
		displayName
	}));
	const body = {};
	let status = 200;
	if (createRes) {
		body.message = `Modified thesaurus ${displayName}`;
	} else {
		body.error = `Something went wrong when trying to modify thesaurus ${displayName}!`;
		status = 500;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
} // function post
