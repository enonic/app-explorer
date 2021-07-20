//import {toStr} from '@enonic/js-utils';

import {jsonError} from '/lib/explorer/jsonError';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {modify} from '/lib/explorer/node/modify';
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
		//id, // This is not in use nodeTypes/thesaurus add _parentPath
		languages,
		name
	} = obj;
	//log.info(`displayName:${toStr(displayName)}`);
	//log.info(`id:${toStr(id)}`);
	//log.info(`languages:${toStr(languages)}`);
	//log.info(`name:${toStr(name)}`);

	const modifyRes = modify(thesaurus({
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
	if (modifyRes) {
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
