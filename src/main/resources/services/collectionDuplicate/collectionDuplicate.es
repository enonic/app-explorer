import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {exists} from '/lib/explorer/collection/exists';
import {get} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';

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
				createOrModifyJobsFromCollectionNode({
					connection: writeConnection,
					collectionNode: createdNode,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				});
			}
		} catch (e) {
			log.error('e', e);
			body.error(`Something went wrong while trying to duplicate ${name}!`);
			status = 500;
		}
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
}
