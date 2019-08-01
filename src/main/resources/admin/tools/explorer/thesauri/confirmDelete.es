import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


export function confirmDelete({
	path
}) {
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const name = pathParts[2];
	return htmlResponse({
		main: `<form action="${TOOL_PATH}/thesauri/delete/${name}" class="ui form" method="post">
	<h1>Confirm delete thesaurus</h1>
	<div class="ui field">
		<label>Type in thesaurus name to confirm</label>
		<input name="typedThesaurusName" value=""/>
	</div>
	<button class="ui button" type="submit"><i class="red trash alternate outline icon"></i> Confirm delete thesaurus</button>
	</form>`
	});
} // confirmDelete
