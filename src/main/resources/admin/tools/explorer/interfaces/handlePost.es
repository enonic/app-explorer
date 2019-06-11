//import {toStr} from '/lib/util';
import {
	BRANCH_ID_EXPLORER,
	NT_INTERFACE,
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';


export function handlePost({
	params,
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1]; // create update delete
	const interfaceName = pathParts[2];
	//log.info(toStr({params, path, relPath, pathParts, action, interfaceName}));

	const connection = connect({
		repoId: REPO_ID_EXPLORER,
		branch: BRANCH_ID_EXPLORER,
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const messages = [];
	let status = 200;

	if (action === 'delete') {
		const {typedInterfaceName} = params;
		if (!typedInterfaceName) {
			messages.push('Missing required parameter "typedInterfaceName"!');
			status = 400;
		} else if (typedInterfaceName !== interfaceName) {
			messages.push(`Typed interface name: "${typedInterfaceName}" doesn't match actual interface name: "${interfaceName}"!`);
			status = 400;
		} else {
			const nodePath = `/interfaces/${interfaceName}`;
			const deleteRes = connection.delete(nodePath);
			if(deleteRes) {
				messages.push(`Interface with path:${nodePath} deleted.`)
			} else {
				messages.push(`Something went wrong when trying to delete interface with path:${nodePath}.`)
				status = 500;
			}
		}
	} else {
		const {json} = params;
		//log.info(toStr({json}));

		const obj = JSON.parse(json);
		//log.info(toStr({obj}));

		obj.__connection = connection; // eslint-disable-line no-underscore-dangle
		obj._indexConfig = {default: 'byType'};
		obj._parentPath = '/interfaces';
		obj.displayName = obj.name;
		obj.type = NT_INTERFACE;

		if (action === 'create') {
			obj._name = obj.name;
			//log.info(toStr({obj}));
			const node = create(obj);
			if (node) {
				messages.push(`Interface ${obj.name} created.`);
			} else {
				messages.push(`Something went wrong when trying to create interface ${obj.name}!`);
				status = 500;
			}
		} else if (action === 'update') {
			obj._name = interfaceName;
			//log.info(toStr({obj}));
			const node = modify(obj);
			if (node) {
				messages.push(`Interface ${obj.name} updated.`);
			} else {
				messages.push(`Something went wrong when trying to update interface ${obj.name}!`);
				status = 500;
			}
		}
	}

	return {
		redirect: `${TOOL_PATH}/interfaces/list?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}

} // function handlePost
