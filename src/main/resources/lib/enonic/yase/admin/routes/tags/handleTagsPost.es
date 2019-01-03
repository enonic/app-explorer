import {toStr} from '/lib/enonic/util';
import {NT_TAG, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {createNode} from '/lib/enonic/yase/admin/createNode';
import {tagsPage} from '/lib/enonic/yase/admin/routes/tags/tagsPage';


export function handleTagsPost({
	params: {
		_parentPath = '/tags',
		name,
		phrase
	}
}) {
	log.info(toStr({_parentPath, name, phrase}));

	const createNodeParams = {
		_parentPath,
		_name: name,
		_indexConfig: {
			default: 'byType'
		},
		phrase,
		type: NT_TAG
	};
	log.info(toStr({createNodeParams}));

	const node = createNode(createNodeParams);
	log.info(toStr({node}));

	return tagsPage({
		path: `${TOOL_PATH}/tags`
	}, {
		messages: node
			? [`Tag ${_parentPath}/${name} created.`]
			: [`Something went wrong while creating tag ${_parentPath}/${name}!`],
		status: node ? 200 : 500
	});
}
