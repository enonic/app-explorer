//import {toStr} from '/lib/util';

import {
	NT_STOP_WORDS,
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';


export function createOrUpdate({
	params: {
		json
	},
	path
}) {
	//log.info(toStr({json}));
	const data = JSON.parse(json);
	const {name, words} = data;
	let {displayName = ''} = data;
	if(displayName === '') {
		displayName = name;
	}
	//log.info(toStr({name, displayName, words}));

	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const nameFromPath = action === 'update' ? pathParts[2] : name;

	let status = 200;
	const messages = [];

	if(action === 'update' && name !== nameFromPath) {
		messages.push(`Name ${name} in params does not match name in request ${nameFromPath}`);
		status = 500;
	} else {
		const params = {
			__connection: connect({principals: [PRINCIPAL_EXPLORER_WRITE]}),
			_indexConfig: {default: 'byType'},
			_parentPath: '/stopwords',
			_name: nameFromPath,
			displayName,
			words,
			type: NT_STOP_WORDS
		};
		const node = action === 'update' ? modify(params) : create(params);

		if(node) {
			messages.push(`Stop words list ${name} saved.`);
		} else {
			messages.push(`Something went wrong when saving stop words list ${name}!`);
			status = 500;
		}
	}

	return {
		redirect: `${TOOL_PATH}/stopwords/list?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
}
