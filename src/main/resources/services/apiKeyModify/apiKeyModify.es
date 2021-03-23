//import {toStr} from '/lib/util';
import {
	//NT_API_KEY,
	PATH_API_KEYS,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';
import {getUser} from '/lib/xp/auth';

export function post({
	body: json
}) {
	//log.info(`json:${json}`);

	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);

	const {
		name,
		key
	} = obj;

	const body = {};
	let status = 200;

	if (!name) {
		body.error = 'Name cannot be empty!';
		status = 400;
	} else {
		try {
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});
			const modifiedNode = writeConnection.modify({
				key: `${PATH_API_KEYS}/${name}`,
				editor: (node) => {
					Object.keys(obj).forEach((property) => {
						//log.info(`property:${property}`);
						if (!(
							property.startsWith('_') ||
							[
								'creator',
								'createdTime',
								'key', // key is set below
								'type'
							].includes(property)
						)) {
							const value = obj[property];
							node[property] = value;
						} /*else {
							log.info(`Ignoring property:${property} value:${toStr(obj[property])}`);
						}*/
						node.modifiedTime = new Date();
						node.modifier = getUser().key;
						if (key) {
							node.key = hash(key);
						}
					});
					return node;
				}
			});
			//log.info(`modifiedNode:${toStr(modifiedNode)}`);
			if (modifiedNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				body.name = modifiedNode._name;
			} else {
				throw new Error(`Something went wrong when trying to modify apiKey ${name}`);
			}
		} catch (e) {
			log.error('e:', e);
			body.error = `Something went wrong when trying to modify apiKey ${name}`;
			status = 500;
		}
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
