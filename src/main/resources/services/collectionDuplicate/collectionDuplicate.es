import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {get} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';



export function post({
	params: {
		name
	}
}) {
	const connection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
	const node = get({
		connection,
		name
	});
	let body = {
		error: `Could not duplicate collection ${name}!`
	};
	let status = 400;
	if (node) {
		let number = 1;
		while(exists({
			connection,
			name: `${name}${number}`
		})) {
			number++;
			log.info(`number:${number}`);
		}

		node._id = undefined;
		node._name = `${name}${number}`;
		node.displayName = `${node.displayName} (duplicate ${number})`;
		const createdNode = create({
			__connection: connection,
			_parentPath: '/collections',
			...node
		});
		if(createdNode) {
			body = {
				message: `Duplicated collection ${name}.`
			},
			status = 200
		}
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}
