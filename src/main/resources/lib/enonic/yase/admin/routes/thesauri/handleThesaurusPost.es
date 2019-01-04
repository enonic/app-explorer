import {NT_SYNONYM, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {thesaurusPage} from '/lib/enonic/yase/admin/routes/thesauri/thesaurusPage';
import {createOrModifyNode} from '/lib/enonic/yase/admin/createOrModifyNode';
import {toStr} from '/lib/enonic/util';


export function handleThesaurusPost({
	params: {
		from,
		to
	},
	path
}) {
	const _parentPath = path.replace(TOOL_PATH, '');
	log.info(toStr({
		from, to, path, _parentPath
	}));
	const node = createOrModifyNode({
		_parentPath,
		_name: from,
		_indexConfig: {
			default: 'byType'
		},
		//displayName: from,
		from,
		to,
		type: NT_SYNONYM
	});
	return thesaurusPage({
		messages: node
			? [`Saved synonym ${from}.`]
			: [`Something went wrong when trying to save synonym ${from}!`],
		path,
		status: node ? 200 : 500
	});
}
