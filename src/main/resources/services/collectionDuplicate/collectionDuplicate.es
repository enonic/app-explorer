import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {get} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
//import {toStr} from '/lib/util';

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
		node.doCollect = false; // Duplicates should not be scheduled by default.
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
		}
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}
