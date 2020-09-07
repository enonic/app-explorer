import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {get} from '/lib/explorer/collection/get';
import {getCollectors} from '/lib/explorer/collection/reschedule';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {toStr} from '/lib/util';
import {send as sendEvent} from '/lib/xp/event';

export function post({
	params: {
		name
	}
}) {
	const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
	const node = get({
		connection: writeConnection,
		name
	});
	let body = {
		error: `Could not duplicate collection ${name}!`
	};
	let status = 400;
	if (node) {
		let number = 1;
		while(exists({ // WARNING This could theoretically go on for a while...
			connection: writeConnection,
			name: `${name}${number}`
		})) {
			number++;
			//log.info(`number:${number}`);
		}

		node._id = undefined;
		node._name = `${name}${number}`;
		node.name = node._name; // Make sure the duplicate can be renamed...
		node.displayName = `${node.displayName} (duplicate ${number})`;
		const createdNode = create({
			__connection: writeConnection,
			_parentPath: '/collections',
			...node
		});
		if(createdNode) {
			body = {
				message: `Duplicated collection ${name}.`
			};
			status = 200;
			const event = {
				type: `${app.name}.reschedule`,
				distributed: true, // Change may happen on admin node, while crawl node needs the reschedule
				data: {
					collectors: getCollectors({
						connection: writeConnection
					}),
					node: createdNode
				}
			};
			log.info(`event:${toStr({event})}`);
			const sendEventRes = sendEvent(event);
			log.info(`sendEventRes:${toStr({sendEventRes})}`);
		}
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}
