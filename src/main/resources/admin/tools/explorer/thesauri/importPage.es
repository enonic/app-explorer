import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {menu} from '/admin/tools/explorer/thesauri/menu';


export function importPage({
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const thesaurusName = pathParts[2];
	return htmlResponse({
		main:`${menu({path})}
<form
	action="${TOOL_PATH}/thesauri/import/${thesaurusName}"
	autocomplete="off"
	class="ui form"
	enctype="multipart/form-data"
	method="POST"
	style="width: 100%;"
>
	<div class="ui header">Import</div>
	<div class="grouped fields">
		<div class="field">
			<label>Name</label>
			<input accept="text/csv" name="file" type="file">
		</div>
		<div class="field">
			<button class="ui button" type="submit"><i class="green upload icon"></i> Import csv</button>
		</div>
	</div>
</form>`,
		path,
		title: `Import thesaurus ${thesaurusName}`
	});
} // importPage
