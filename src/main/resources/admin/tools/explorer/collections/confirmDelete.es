//import {toStr} from '/lib/util';
import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


export const confirmDelete = ({
	path
}) => {
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const name = pathParts[2];
	return htmlResponse({
		main: `<form action="${TOOL_PATH}/collections/delete/${name}" class="ui form" method="post">
	<h1>Confirm delete collection</h1>
	<div class="ui field">
		<label>Type in collection name to confirm</label>
		<input name="typedCollectionName" value=""/>
	</div>
	<button class="ui button" type="submit"><i class="red trash alternate outline icon"></i> Confirm delete collection</button>
</form>`
	});
} // confirmDelete
