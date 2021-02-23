//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {sanitize} from '/lib/xp/common';
import {send as sendEvent} from '/lib/xp/event';

import {getCollectors} from '/lib/explorer/collection/reschedule';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';
import {modify} from '/lib/explorer/node/modify';

export function post({
	body: json
}) {
	//log.debug(`json:${json}`);

	const obj = JSON.parse(json);

	const writeConnection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	//log.debug(`obj._path:${toStr(obj._path)}`);
	const oldNode = writeConnection.get(obj._path);
	//log.debug(`oldNode:${toStr({oldNode})}`);

	const sanitizedName = sanitize(obj.displayName);
	if (sanitizedName !== obj._name) {
		const moveParams = {
			source: obj._path,
			target: sanitizedName
		};
		//log.debug(`moveParams:${toStr({moveParams})}`);
		const boolMoved = writeConnection.move(moveParams);
		if (boolMoved) {
			obj._name = sanitizedName;
		}
	}

	if (obj.collector && obj.collector.name && obj.collector.name === 'com.enonic.app.explorer:api' ) {
		obj.collector.config.apiKeys = forceArray(obj.collector.config.apiKeys).map(({
			comment,
			dateTime,
			key,
			hashed = false
		}) => ({
			comment,
			dateTime,
			key: hashed ? key : hash(key),
			hashed: true
		}));
	}

	obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
	//log.debug(`obj:${toStr({obj})}`);

	const params = collection(obj); // Strips _id, _path
	//log.debug(`params:${toStr({params})}`);

	const node = modify({
		__connection: writeConnection,
		...params
	});

	const body = {};
	let status = 200;
	if (node) {
		body.name = node._name;
		body.displayName = node.displayName;
		const event = {
			type: `${app.name}.reschedule`,
			distributed: true, // Change may happen on admin node, while crawl node needs the reschedule
			data: {
				collectors: getCollectors({
					connection: writeConnection
				}),
				node,
				oldNode
			}
		};
		//log.debug(`event:${toStr({event})}`);
		sendEvent(event);
	} else {
		body.error = `Something went wrong when trying to modify collection ${node._name}`;
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
