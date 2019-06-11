import {toStr} from '/lib/util';
import {sanitize} from '/lib/xp/common';

import {
	BRANCH_ID_EXPLORER,
	NT_FIELD,
	NT_FIELD_VALUE,
	PRINCIPAL_EXPLORER_WRITE,
	REPO_ID_EXPLORER,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';
import {ucFirst} from '/lib/explorer/ucFirst';
import {FieldValue} from '/lib/explorer/nodeTypes/FieldValue';


export function handleFieldsPost({
	params,
	path: reqPath
}) {
	const relPath = reqPath.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1]; // update, delete, values
	const fieldName = pathParts[2];
	const valueAction = pathParts[3];
	const valueName = pathParts[4];
	//log.info(toStr({fieldName, action, valueName, valueAction}));

	const connection = connect({
		repoId: REPO_ID_EXPLORER,
		branch: BRANCH_ID_EXPLORER,
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const messages = [];
	let status = 200;
	if(action === 'values') {
		if(valueAction === 'delete') {
			const nodePath = `/fields/${fieldName}/${valueName}`;
			const deleteRes = connection.delete(nodePath);
			messages.push(deleteRes.length
				? `Field value with path:${nodePath} deleted.`
				: `Something went wrong when trying to delete field value with path:${nodePath}.`);
			//log.info(toStr({deleteRes}));
			if (!deleteRes.length) { status = 500; }
			return {
				redirect: `${TOOL_PATH}/fields/edit/${fieldName}?${
					messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
				}&status=${status}`
			}
		}

		let {value, displayName} = params;
		//log.info(toStr({value, displayName}));
		if (!value) {
			if (!displayName) {
				messages.push(`You must provide either value or display name!`);
				status = 400;
				return {
					redirect: `${TOOL_PATH}/fields/edit/${fieldName}?${
						messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
					}&status=${status}`
				}
			}
			value = sanitize(displayName);
		} else if (!displayName) {
			displayName = ucFirst(value);
		}

		if(valueName && valueName !== value) {
			messages.push(`You are not allowed to modify the value, only the displayName!`);
			status=400;
		}
		const valueNodeParentPath = `/fields/${fieldName}`;
		const valueNodeName = sanitize(value.toLowerCase());
		const valueNodePath = `${valueNodeParentPath}/${valueNodeName}`;

		const fv = new FieldValue({
			__connection: connection,
			_parentPath: valueNodeParentPath,
			_name: valueNodeName,
			displayName,
			field: fieldName
		});
		//log.info(toStr({fv}));
		const node = valueName ? fv.modify() : fv.create();

		if(node) {
			messages.push(`Field value with path:${valueNodePath} ${valueName ? 'modified' : 'created'}.`);
		} else {
			messages.push(`Something went wrong when trying to ${valueName ? 'modify' : 'create'} field value with path:${valueNodePath}.`);
			status = 500;
		}

		return {
			redirect: `${TOOL_PATH}/fields/edit/${fieldName}?${
				messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
			}&status=${status}`
		}
	} // values

	if (action === 'delete') {
		const path = `/fields/${fieldName}`;
		const deleteRes = connection.delete(path);
		//log.info(toStr({deleteRes}));
		messages.push(deleteRes.length
			? `Field with path:${path} deleted.`
			: `Something went wrong when trying to delete field with path:${path}.`);
		if(!deleteRes.length) { status = 500; }
		return {
			redirect: `${TOOL_PATH}/fields?${
				messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
			}&status=${status}`
		}
	} // if action === 'delete'

	let {
		key,
		displayName
	} = params;
	const {
		description = '',
		//iconUrl = '',
		instruction = 'type',
		decideByType = 'on',
		enabled = 'on',
		nGram = 'on',
		fulltext = 'on',
		includeInAllText = 'on',
		path,
		fieldType = 'text'
	} = params;
	if (!key) {
		if (!displayName) {
			messages.push('You must provide either key or Display name!');
			status = 400;
			return {
				redirect: `${TOOL_PATH}/fields?${
					messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
				}&status=${status}`
			}
		}
		key = sanitize(displayName);
	} else if (!displayName) {
		displayName = ucFirst(key);
	}
	/*log.info(toStr({
		key,
		instruction,
		decideByType,
		enabled,
		nGram,
		fulltext,
		includeInAllText,
		path,
	}));*/
	const lcKey = key.toLowerCase();
	const nodeParams = {
		__connection: connection,
		_indexConfig: {default: 'byType'},
		_name: lcKey,
		_parentPath: '/fields',
		description,
		displayName,
		fieldType,
		key: lcKey,
		//iconUrl,
		indexConfig: instruction === 'custom' ? {
			decideByType: decideByType && decideByType === 'on',
			enabled: enabled && enabled === 'on',
			nGram: nGram && nGram === 'on',
			fulltext: fulltext && fulltext === 'on',
			includeInAllText: includeInAllText && includeInAllText === 'on',
			path: path && path === 'on'
		} : instruction,
		type: NT_FIELD
	};
	const node = fieldName ? modify(nodeParams) : create(nodeParams);
	//log.info(toStr({node}));
	messages.push(node
		? `Field with key:${lcKey} ${fieldName ? 'modified' : 'created'}.`
		: `Something went wrong when trying to ${fieldName ? 'modify' : 'create'} field with key:${lcKey}.`);
	if (!node) { status = 500;}
	return {
		redirect: `${TOOL_PATH}/fields?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
} // function post
