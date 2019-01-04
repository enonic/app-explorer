import {NT_THESAURUS} from '/lib/enonic/yase/admin/constants';
import {listThesauriPage} from '/lib/enonic/yase/admin/routes/thesauri/listThesauriPage';
import {createNode} from '/lib/enonic/yase/admin/createNode';


export function handleThesauriPost({
	params: {
		name
	},
	path
}) {
	const node = createNode({
		_parentPath: '/thesauri',
		_name: name,
		_indexConfig: {
			default: 'byType'
		},
		displayName: name,
		type: NT_THESAURUS
	});
	return listThesauriPage({
		messages: node
			? [`Created thesauri named ${name}.`]
			: [`Something went wrong when trying to create thesauri named ${name}!`],
		path,
		status: node ? 200 : 500
	});
}
