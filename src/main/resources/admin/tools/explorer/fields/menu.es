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
		<a class="item${action === 'new' ? ' active' : ''}" href="${TOOL_PATH}/fields/new"><i class="green plus icon"></i> New</a>
	</div>
</nav>`;
}
