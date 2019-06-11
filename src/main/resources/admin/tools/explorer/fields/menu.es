import {
	DEFAULT_FIELDS,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';


export const menu = ({
	path
}) => {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const name = pathParts[2];
	const defaultFields = DEFAULT_FIELDS.map(({_name})=>_name);
	return `<nav class="stackable secondary ui menu">
	<div class="ui container">
		<a class="item${(!action || action === 'list') ? ' active' : ''}" href="${TOOL_PATH}/fields/list"><i class="sitemap icon"></i> List</a>
		<a class="item${action === 'new' ? ' active' : ''}" href="${TOOL_PATH}/fields/new"><i class="green plus icon"></i> New</a>
		<a class="${name ? '' : 'disabled '}item${action === 'edit' ? ' active' : ''}" href="${TOOL_PATH}/fields/edit/${name}"><i class="edit icon"></i> Edit</a>
		<a class="${name && !defaultFields.includes(name) ? '' : 'disabled '}item${action === 'delete' ? ' active' : ''}" href="${TOOL_PATH}/fields/delete/${name}"><i class="trash alternate outline edit icon"></i> Delete</a>
	</div>
</nav>`;
}
