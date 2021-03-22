//import {toStr} from '/lib/util';
import {
	NT_API_KEY,
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
	} else if (!key) {
		body.error = 'Key cannot be empty!';
		status = 400;
	} else {
		const data = {
			_indexConfig: {default: 'byType'},
			_inheritsPermissions: true,
			_parentPath: PATH_API_KEYS,
			_name: name,
			creator: getUser().key,
			hashed: true,
			key: hash(key),
			type: NT_API_KEY
		};
		//log.info(`data:${toStr(data)}`);
		try {
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});
			const createdNode = writeConnection.create(data);
			//log.info(`createdNode:${toStr(createdNode)}`);
			if (createdNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				body.name = createdNode._name;
			} else {
				throw new Error(`Something went wrong when trying to create apiKey ${name}`);
			}
		} catch (e) {
			log.error('e:', e);
			body.error = `Something went wrong when trying to create apiKey ${name}`;
			status = 500;
		}
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
