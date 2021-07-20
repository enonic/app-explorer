//import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {get} from '/lib/explorer/node/get';
import {modify} from '/lib/explorer/node/modify';
import {dirname} from '/lib/explorer/path/dirname';
import {connect} from '/lib/explorer/repo/connect';


export function post({
	params: {
		fromJson,
		id,
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

		/*const thesaurusNode = get({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			path: thesaurusId
		});
		//log.info(`synonymCreate thesaurusNode:${toStr(thesaurusNode)}`);
		if (!thesaurusNode) {
			throw new Error(`Unable to find thesaurus with id:${thesaurusId}!`);
		}*/

		const synonymNode = get({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			path: id
		});
		if (!synonymNode) {
			throw new Error(`Unable to find synonym with id:${id}!`);
		}

		const modifyRes = modify({
			//_id: id, // Gets stripped!!!
			//_parentPath: thesaurusNode._path,
			_parentPath: dirname(synonymNode._path),
			_name: synonymNode._name,
			displayName: `${Array.isArray(from) ? from.join(', ') : from} => ${Array.isArray(to) ? to.join(', ') : to}`,
			from,
			to
		}, {
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			})
		});
		if (!modifyRes) {
			throw new Error(`Something went wrong when trying to modify synonym id:${id} from:${fromJson} to:${toJson} in thesaurus with id:${thesaurusId}!`);
		}
		body.message=`Modified synonym id:${id} from:${fromJson} to:${toJson} in thesaurus with id:${thesaurusId}`;
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
