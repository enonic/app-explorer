import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


export function confirmDelete({
	path: reqPath
}) {
	const relPath = reqPath.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const interfaceName = pathParts[2];
	return htmlResponse({
		main: `<form action="${TOOL_PATH}/interfaces/delete/${interfaceName}" class="ui form" method="post">
	<h1>Confirm delete interface</h1>
	<div class="field">
		<label>Type in interface name to confirm</label>
		<input name="typedInterfaceName" value=""/>
	</div>
	<button class="ui button" type="submit"><i class="red trash alternate outline icon"></i> Confirm delete interface</button>
</form>`
	});
} // deleteInterfacePage
