import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {thesaurus} from '/lib/explorer/model/2/nodeTypes/thesaurus';


export function post({
	params: {
		displayName,
		name
	}
}) {
	const createRes = create(thesaurus({
		__connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		}),
		_name: name,
		displayName
	}));
	const body = {};
	let status = 200;
	if (createRes) {
		body.message = `Created thesaurus ${displayName}`;
	} else {
		body.error = `Something went wrong when trying to create thesaurus ${displayName}!`;
		status = 500;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
} // function post
