import {NT_SYNONYM, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {thesaurusPage} from '/lib/enonic/yase/admin/routes/thesauri/thesaurusPage';
import {createNode} from '/lib/enonic/yase/admin/createNode';
import {modifyNode} from '/lib/enonic/yase/admin/modifyNode';
import {toStr} from '/lib/enonic/util';


export function handleThesaurusPost({
	params: {
		from = '',
		id,
		to = ''
	},
	path
}) {
	const _parentPath = path.replace(TOOL_PATH, '');
	log.info(toStr({
		from, id, to, path, _parentPath
	}));
	const displayName = `${Array.isArray(from) ? from.join(', ') : from} => ${Array.isArray(to) ? to.join(', ') : to}`;
	const params = {
		_parentPath,
		_name: displayName,
		_indexConfig: {
			default: 'byType'
		},
		displayName,
		from,
		to,
		type: NT_SYNONYM
	};

	if (id) {
		params.key = id;
		const node = modifyNode(params);
		return thesaurusPage({
			messages: node
				? [`Updated synonym ${from}.`]
				: [`Something went wrong when trying to update synonym ${from}!`],
			path,
			status: node ? 200 : 500
		});
	}

	const node = createNode(params);
	return thesaurusPage({
		messages: node
			? [`Created synonym ${from}.`]
			: [`Something went wrong when trying to create synonym ${from}!`],
		path,
		status: node ? 200 : 500
	});
}
