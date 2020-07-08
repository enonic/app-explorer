//import generateUuidv4 from 'uuid/v4';

//import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection'
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';


export function post({
	body: json
}) {
	//log.info(`json:${json}`);

	const obj = JSON.parse(json);

	// WARNING This sets the node _name to whatever the user typed, may conflict!!!
	// But thats ok, we like collection repos to have recognizeable names.
	obj._name = sanitize(obj.displayName);

	obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
	//log.info(`obj:${toStr({obj})}`);

	const params = collection(obj);
	//log.info(`params:${toStr({params})}`);

	const node = create({
		__connection: connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		}),
		...params
	});

	const body = {};
	let status = 200;
	if (node) {
		//body.name = node._name; // Have no idea why I did this :)
		body.name = node.name; // So lets do this instead :)
		body.displayName = node.displayName;
	} else {
		body.error = `Something went wrong when trying to create collection ${name}`;
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
