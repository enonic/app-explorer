//import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';
import {send as sendEvent} from '/lib/xp/event';

import {getCollectors} from '/lib/explorer/collection/reschedule';
import {
	//NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';


export function post({
	body: json
}) {
	//log.debug(`json:${json}`);

	const obj = JSON.parse(json);

	// WARNING This sets the node _name to whatever the user typed, may conflict!!!
	// But thats ok, we like collection repos to have recognizeable names.
	obj._name = sanitize(obj.displayName);

	obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
	//log.debug(`obj:${toStr({obj})}`);

	const params = collection(obj);
	//log.debug(`params:${toStr({params})}`);

	const writeConnection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const node = create({
		__connection: writeConnection,
		...params
	});

	const body = {};
	let status = 200;
	if (node) {
		//body.name = node._name; // Have no idea why I did this :)
		body.name = node.name; // So lets do this instead :)
		body.displayName = node.displayName;
		const event = {
			type: `${app.name}.reschedule`,
			distributed: true, // Change may happen on admin node, while crawl node needs the reschedule
			data: {
				collectors: getCollectors({
					connection: writeConnection
				}),
				node
			}
		};
		//log.debug(`event:${toStr({event})}`);
		sendEvent(event);
	} else {
		body.error = `Something went wrong when trying to create collection ${obj._name}`;
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
