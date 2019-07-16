//import {toStr} from '/lib/util';
import {
	NT_STOP_WORDS,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';


export function post({
	params: {
		mode,
		name,
		displayName,
		words
	}
}) {
	/*log.info(toStr({
		mode,
		name,
		displayName,
		words
	}));*/
	const params = {
		__connection: connect({principals: [PRINCIPAL_EXPLORER_WRITE]}),
		_indexConfig: {default: 'byType'},
		_parentPath: '/stopwords',
		_name: name,
		displayName,
		words,
		type: NT_STOP_WORDS
	};
	const node = mode === 'update' ? modify(params) : create(params);
	//log.info(`node:${toStr(node)}`);
	const body = {};
	let status = 200;
	if (node) {
		body.name = name;
		body.displayName = displayName;
		body.words = words;
	} else {
		status = 500;
		body.error = `Something went wrong when trying to ${mode === 'update' ? 'modify' : 'create'} stopwords ${name}`;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
