import {TOOL_PATH} from '/lib/explorer/model/2/constants';


export const menu = ({
	path
}) => {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const name = pathParts[2];
	return `<nav class="stackable secondary ui menu">
	<div class="ui container">
		<a class="item${(!action || action === 'list') ? ' active' : ''}" href="${TOOL_PATH}/collections/list"><i class="database icon"></i> List</a>
		<a class="item${action === 'new' ? ' active' : ''}" href="${TOOL_PATH}/collections/new"><i class="green plus icon"></i> New</a>
		<a class="${name ? '' : 'disabled '}item${action === 'edit' ? ' active' : ''}" href="${TOOL_PATH}/collections/edit/${name}"><i class="edit icon"></i> Edit</a>
		<a class="${name ? '' : 'disabled '}item${action === 'delete' ? ' active' : ''}" href="${TOOL_PATH}/collections/delete/${name}"><i class="trash alternate outline edit icon"></i> Delete</a>
		<a class="item${action === 'status' ? ' active' : ''}" href="${TOOL_PATH}/collections/status"><i class="cogs icon"></i> Status</a>
		<a class="item${action === 'journal' ? ' active' : ''}" href="${TOOL_PATH}/collections/journal"><i class="newspaper outline icon"></i> Journal</a>
	</div>
</nav>`;
}
