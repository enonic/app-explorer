//import {toStr} from '/lib/util';
//import {forceArray} from '/lib/util/data';
import {getUser} from '/lib/xp/auth';
import {sanitize} from '/lib/xp/common';
import {send as sendEvent} from '/lib/xp/event';

import {getCollectors} from '/lib/explorer/collection/reschedule';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection';
import {connect} from '/lib/explorer/repo/connect';
//import {hash} from '/lib/explorer/string/hash';


export function post({
	body: json
}) {
	//log.info(`json:${json}`);

	const body = {};
	let status = 200;

	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);

	if(!obj._name) {
		body.error = 'Name cannot be empty!';
		status = 400;
	} else {
		try {
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});

			//log.debug(`obj._path:${toStr(obj._path)}`);
			const oldNode = writeConnection.get(obj._path);
			//log.info(`oldNode:${toStr(oldNode)}`);

			const sanitizedName = sanitize(obj._name);
			//log.info(`sanitizedName:${sanitizedName}`);

			if (sanitizedName !== oldNode._name) {
				const moveParams = {
					source: obj._path,
					target: sanitizedName
				};
				//log.debug(`moveParams:${toStr({moveParams})}`);
				const boolMoved = writeConnection.move(moveParams);
				if (boolMoved) {
					obj._name = sanitizedName;
				}
				writeConnection.refresh(); // So the data becomes immidiately searchable
			}

			obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
			//log.info(`obj:${toStr({obj})}`);

			const params = collection(obj); // Strips _id, _path
			//log.info(`params:${toStr({params})}`);

			const modifiedNode = writeConnection.modify({
				key: obj._path,
				editor: (n) => {
					//log.info(`node before modifying:${toStr({n})}`);
					Object.keys(params).forEach((property) => {
						//log.info(`property:${property}`);
						if (!(
							property.startsWith('_') ||
							['creator', 'createdTime', 'type'].includes(property)
						)) {
							const value = params[property];
							n[property] = value;
						} /*else {
							log.info(`Ignoring property:${property} value:${toStr(params[property])}`);
						}*/
					});
					n.modifiedTime = new Date();
					n.modifier = getUser().key;
					//log.info(`modifiedNode to be stored:${toStr({n})}`);
					return n;
				}
			});
			//log.info(`modifiedNode:${toStr({modifiedNode})}`);
			writeConnection.refresh(); // So the data becomes immidiately searchable

			if (modifiedNode) {
				body.name = modifiedNode._name;
				const collectors = getCollectors({
					connection: writeConnection
				});
				//log.debug(`collectors:${toStr({collectors})}`);
				const event = {
					type: `${app.name}.reschedule`,
					distributed: true, // Change may happen on admin node, while crawl node needs the reschedule
					data: {
						collectors,
						modifiedNode,
						oldNode
					}
				};
				//log.debug(`event:${toStr({event})}`);
				sendEvent(event);
			} else {
				throw new Error(`Something went wrong when trying to modify collection ${modifiedNode._name}`);
			}
		} catch (e) {
			log.error('e', e);
			body.error = `Something went wrong when trying to modify collection ${obj._name}`;
			status = 500;
		}
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
