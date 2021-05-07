//import {toStr} from '/lib/util';
//import {sanitize} from '/lib/xp/common';

import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {field} from '/lib/explorer/model/2/nodeTypes/field';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
//import {ucFirst} from '/lib/explorer/ucFirst';


export function post({params: {
	json
}}) {
	//log.info(`json:${json}`);
	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);
	let {
		key
	} = obj;
	const {
		allowArray = false,
		description = '',
		min = 0,
		max = 0,
		//iconUrl = '',
		instruction = 'type',
		decideByType = true,
		enabled = true,
		nGram = true, // node._indexConfig.default.nGram uses uppercase G in nGram
		fulltext = true,
		includeInAllText = true,
		path = false,
		fieldType = 'text'
	} = obj;
	if (!key) {
		return {
			body: {
				error: 'You must provide key!'
			},
			status: 400,
			contentType: RT_JSON
		};
	}

	const lcKey = key.toLowerCase();
	const nodeParams = field({
		__connection: connect({principals: PRINCIPAL_EXPLORER_WRITE}),
		_name: lcKey,
		allowArray,
		description,
		fieldType,
		key: lcKey,
		min,
		max,
		//iconUrl,
		instruction,
		decideByType,
		enabled,
		nGram,
		fulltext,
		includeInAllText,
		path
	});
	const node = create(nodeParams);

	let body = {
		message: `Field with key:${lcKey} created.`
	};
	let status = 200;

	if (!node) {
		body = {
			error: `Something went wrong when trying to create field with key:${lcKey}.`
		};
		status = 500;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
