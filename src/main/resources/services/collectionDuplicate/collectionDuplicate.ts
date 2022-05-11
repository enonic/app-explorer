import {
	RESPONSE_TYPE_JSON//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {get} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';


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
		try {
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

			const createdNode = create({
				_parentPath: '/collections',
				...node
			}, {
				connection: writeConnection
			});
			if(createdNode) {
				body = {
					message: `Duplicated collection ${name}.`
				};
				status = 200;
			}
		} catch (e) {
			log.error('e', e);
			body.error = `Something went wrong while trying to duplicate ${name}!`;
			status = 500;
		}
	}
	return {
		body,
		contentType: RESPONSE_TYPE_JSON,
		status
	};
}
