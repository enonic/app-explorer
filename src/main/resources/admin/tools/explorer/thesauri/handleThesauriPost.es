//import {toStr} from '/lib/util';
import {isString} from '/lib/util/value';

import {
	//getMultipartForm,
	getMultipartText
} from '/lib/xp/portal';

import {
	NT_THESAURUS,
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {create} from '/lib/explorer/node/create';
import {modify} from '/lib/explorer/node/modify';
import {parseCsv} from '/lib/explorer/parseCsv';
import {connect} from '/lib/explorer/repo/connect';
import {synonym} from '/lib/explorer/nodeTypes/synonym';


export function handleThesauriPost(req) {
	const {
		params: {
			description,
			name,
			displayName = name,
			typedThesaurusName = ''
		},
		path
	} = req;
	//log.info(toStr({req}));
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const thesaurusName = pathParts[2];

	const messages = [];
	let status = 200;

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	if (action === 'delete') {
		if (!typedThesaurusName) {
			messages.push('Missing required parameter "typedThesaurusName"!');
			status = 400;
		} else if (typedThesaurusName !== thesaurusName) {
			messages.push(`Typed thesaurus name: "${typedThesaurusName}" doesn't match actual thesaurus name: "${thesaurusName}"!`);
			status = 400;
		} else {
			const nodePath = `/thesauri/${thesaurusName}`;
			const deleteRes = connection.delete(nodePath);
			if(deleteRes) {
				messages.push(`Thesaurus with path:${nodePath} deleted.`)
			} else {
				messages.push(`Something went wrong when trying to delete thesaurus with path:${nodePath}.`)
				status = 500;
			}
		}
		return {
			redirect: `${TOOL_PATH}/thesauri?${
				messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
			}&status=${status}`
		}
	} // delete

	if (action === 'import') {
		//const form = getMultipartForm(); log.info(toStr({form}));

		const text = getMultipartText('file'); //log.info(toStr({text}));
		parseCsv({
			csvString: text,
			columns: ['from', 'to'],
			start: 1 // Aka skip line 0
		}).forEach(({from, to}) => {
			//log.info(toStr({from, to}));
			if (
				from // Skip empty cells
				&& to // Skip empty cells
				&& isString(from) && from.trim() // Skip cells with just whitespace, emptystring is Falsy
				&& isString(to) && to.trim() // Skip cells with just whitespace, emptystring is Falsy
			) { // Skip empty values
				const fromArr = from.trim().split(',').map(str => str.trim());
				const toArr = to.trim().split(',').map(str => str.trim());
				const params = synonym({
					__connection: connection,
					_parentPath: `/thesauri/${thesaurusName}`,
					from: fromArr.length > 1 ? fromArr : fromArr.join(),
					to: toArr.length > 1 ? toArr : toArr.join()
				});
				//log.info(toStr({params}));
				createOrModify(params);
			}
		});
		messages.push(`Imported synonyms to ${thesaurusName}.`);
		return {
			redirect: `${TOOL_PATH}/thesauri?${
				messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
			}&status=${status}`
		}
	} // import

	// Create or Update
	const params = {
		__connection: connection,
		_parentPath: '/thesauri',
		_name: action === 'update' ? thesaurusName : name,
		_indexConfig: {
			default: 'byType'
		},
		description,
		displayName,
		type: NT_THESAURUS
	};

	const node = action === 'update' ? modify(params) : create(params);
	if (node) {
		messages.push(`${action === 'update' ? 'Updated' : 'Created'} thesaurus ${displayName}.`);
	} else {
		messages.push(`Something went wrong when trying to ${action === 'update' ? 'update' : 'create'} thesauri ${displayName}!`);
		status = 500;
	}
	return {
		redirect: `${TOOL_PATH}/thesauri/?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
} // handleThesauriPost
