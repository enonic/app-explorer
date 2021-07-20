//import {toStr} from '@enonic/js-utils';

import {jsonError} from '/lib/explorer/jsonError';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {thesaurus} from '/lib/explorer/model/2/nodeTypes/thesaurus';


export function post({
	body: json
}) {
	if (!json) {
		return jsonError('Empty body!');
	}
	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);

	const {
		displayName,
		//id,
		languages,
		name
	} = obj;
	//log.info(`displayName:${toStr(displayName)}`);
	//log.info(`id:${toStr(id)}`);
	//log.info(`languages:${toStr(languages)}`);
	//log.info(`name:${toStr(name)}`);

	const createRes = create(thesaurus({
		_name: name,
		displayName,
		languages
	}), {
		connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		})
	});
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
