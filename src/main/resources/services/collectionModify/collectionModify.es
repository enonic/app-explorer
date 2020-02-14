//import {toStr} from '/lib/util';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection'
import {connect} from '/lib/explorer/repo/connect';
import {modify} from '/lib/explorer/node/modify';


export function post({
	body: json
}) {
	//log.info(`json:${json}`);

	const obj = JSON.parse(json);
	obj._name = obj.name;
	obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
	//log.info(`obj:${toStr({obj})}`);

	const params = collection(obj);
	//log.info(`params:${toStr({params})}`);

	const node = modify({
		__connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		}),
		...params
	});

	const body = {};
	let status = 200;
	if (node) {
		body.name = node._name;
		body.displayName = node.displayName;
	} else {
		body.error = `Something went wrong when trying to modify collection ${name}`;
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
