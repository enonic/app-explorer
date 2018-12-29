export function handleTagsPost({
	params,
	path
}) {
	const {
		name,
		_parentPath = '/tags'
	} = params;
	const locale = {};
	/*Object.keys(params).forEach((key) => {
		if (key.startsWith('locale[')) {
			locale[key.replace(/^locale\[/, '').replace(/\]$/, '')] = params[key];
		}
	});*/
	const createNodeParams = {
		_parentPath,
		_name: name,
		_indexConfig: {
			default: 'byType'
		},
		locale,
		type: NT_TAG
	};
	const node = createNode(createNodeParams);
}
