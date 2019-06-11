import {
	PRINCIPAL_EXPLORER_WRITE,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';


export const handleDelete = ({
	path: reqPath
}) => {
	const relPath = reqPath.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const stopWordsName = pathParts[2];

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});
	const nodePath = `/stopwords/${stopWordsName}`;
	const deleteRes = remove({connection, path: nodePath});
	const messages = [];
	let status = 200;
	if(deleteRes) {
		messages.push(`Collection with path:${nodePath} deleted.`)
	} else {
		messages.push(`Something went wrong when trying to delete collection with path:${nodePath}.`)
		status = 500;
	}
	return {
		redirect: `${TOOL_PATH}/stopwords?${
			messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
		}&status=${status}`
	}
} // handleDelete
