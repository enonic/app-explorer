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
		<a class="item${(!action || action === 'list') ? ' active' : ''}" href="${TOOL_PATH}/thesauri/list"><i class="font icon"></i> List</a>
		<a class="item${action === 'new' ? ' active' : ''}" href="${TOOL_PATH}/thesauri/new"><i class="green plus icon"></i> New</a>
		<a class="${name ? '' : 'disabled '}item${action === 'import' ? ' active' : ''}" href="${TOOL_PATH}/thesauri/import/${name}"><i class="upload icon"></i> Import</a>
		<a class="${name ? '' : 'disabled '}item${action === 'edit' ? ' active' : ''}" href="${TOOL_PATH}/thesauri/edit/${name}"><i class="edit icon"></i> Edit</a>
	</div>
</nav>`;
}
