//import {toStr} from '/lib/util';
import {reference} from '/lib/xp/value';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE,
	NT_SYNONYM,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createRandomNamed} from '/lib/explorer/node/createRandomNamed';
import {get} from '/lib/explorer/node/get';
//import {synonym} from '/lib/explorer/model/2/nodeTypes/synonym'; // Requires _name :(


export function post({
	params: {
		fromJson,
		thesaurusId,
		toJson
	}
}) {
	const body = {};
	let status = 200;
	try {
		//log.info(`synonymCreate fromJson:${fromJson} thesaurusId:${thesaurusId} toJson:${toJson}`);
		const from = JSON.parse(fromJson);
		const to = JSON.parse(toJson);
		//log.info(`synonymCreate from:${toStr(from)} thesaurusId:${thesaurusId} to:${toStr(to)}`);
		const thesaurusNode = get({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			path: thesaurusId
		});
		//log.info(`synonymCreate thesaurusNode:${toStr(thesaurusNode)}`);
		if (!thesaurusNode) {
			throw new Error(`Unable to find thesaurus with id:${thesaurusId}!`);
		}
		const createRes = createRandomNamed({
			_indexConfig: {default: 'byType'},
			_parentPath: thesaurusNode._path,
			displayName: `${Array.isArray(from) ? from.join(', ') : from} => ${Array.isArray(to) ? to.join(', ') : to}`,
			from,
			thesaurusReference: reference(thesaurusNode._id),
			to,
			type: NT_SYNONYM
		}, {
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			})
		});
		if (!createRes) {
			throw new Error(`Something went wrong when trying to create synonym from:${fromJson} to:${toJson} in thesaurus with id:${thesaurusId}!`);
		}
		body.message=`Created synonym from:${fromJson} to:${toJson} in thesaurus with id:${thesaurusId}`;
	} catch (e) {
		body.error=e.message;
		status=500;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
} // post
