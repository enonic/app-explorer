import {NT_THESAURUS} from '/lib/enonic/yase/admin/constants';
import {listThesauriPage} from '/lib/enonic/yase/admin/routes/thesauri/listThesauriPage';
import {createOrModifyNode} from '/lib/enonic/yase/admin/createOrModifyNode';


export function handleThesauriPost({
	params: {
		description,
		name
	},
	path
}) {
	const node = createOrModifyNode({
		_parentPath: '/thesauri',
		_name: name,
		_indexConfig: {
			default: 'byType'
		},
		description,
		displayName: name,
		type: NT_THESAURUS
	});
	return listThesauriPage({
		messages: node
			? [`Saved thesauri named ${name}.`]
			: [`Something went wrong when trying to save thesauri named ${name}!`],
		path,
		status: node ? 200 : 500
	});
}
