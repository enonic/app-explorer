import {toStr} from '/lib/util';

import {
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';
//import {toStr} from '/lib/util';
import {synonym} from '/lib/explorer/nodeTypes/synonym';
import {connect} from '/lib/explorer/repo/connect';


export function handlePost({
	params,
	params: {
		typedThesaurusName = ''
	},
	path
}) {
	//log.info(toStr({params}));
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	//const action = pathParts[1]; // synonyms
	const thesaurusName = pathParts[2];
	const secondaryAction = pathParts[3]; // create delete update
	const synonymName = pathParts[4];
	/*log.info(toStr({
		path, relPath, pathParts, thesaurusName, secondaryAction, synonymName
	}));*/

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const messages = [];
	let status = 200;

	if (secondaryAction === 'delete') {
		const nodePath = `/thesauri/${thesaurusName}/${synonymName}`;
		const deleteRes = connection.delete(nodePath);
		if(deleteRes) {
			messages.push(`Synonym with path:${nodePath} deleted.`)
		} else {
			messages.push(`Something went wrong when trying to delete synonym with path:${nodePath}.`)
			status = 500;
		}
	} else {

		let i = 0;
		const from = [];
		while(params[`from[${i}]`]) {
			from.push(params[`from[${i}]`])
			i++;
		}

		let j = 0;
		const to = [];
		while(params[`to[${j}]`]) {
			to.push(params[`to[${j}]`])
			j++;
		}

		const data = synonym({
			__connection: connection,
			_parentPath: `/thesauri/${thesaurusName}`,
			from,
			to
		});
		//log.info(toStr({data}));
		if (secondaryAction === 'create') {
			const node = create(data);
			if (node) {
				messages.push(`Created synonym ${from}.`);
			} else {
				messages.push(`Something went wrong when trying to create synonym ${from}!`);
				status = 500;
			}
		} else if (secondaryAction === 'update' && synonymName) {
			data._name = synonymName;
			const node = modify(data);
			if (node) {
				messages.push(`Updated synonym ${from}.`);
			} else {
				messages.push(`Something went wrong when trying to update synonym ${from}!`);
				status = 500;
			}
		}
	}

	return {
		redirect: `${TOOL_PATH}/thesauri/edit/${thesaurusName}?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
} // handlePost
