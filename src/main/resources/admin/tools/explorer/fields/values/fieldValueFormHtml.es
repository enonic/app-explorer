import {TOOL_PATH} from '/lib/explorer/model/2/constants';


export function fieldValueFormHtml({
	field = '',
	displayName = '',
	value = '',
	action=`${TOOL_PATH}/fields/values/${field}/${value ? `update/${value}` : 'create'}`
} = {}) {
	return `
<form
	action="${action}"
	autocomplete="off"
	class="ui form"
	method="POST"
	style="width: 100%;"
>
	<h2>${value ? 'Edit' : 'New'} value</h2>

	<div class="grouped fields">
		<div class="field">
			<label>Value</label>
			${value ? `<span>${value}</span><input name="value" type="hidden" value="${value}"/>` : `<input name="value" type="text" value="${value}"/>
			<p class="help-text">Used to mark scraped documents and during aggregation.</p>`}
		</div>
		<div class="field">
			<label>Display name</label>
			<input name="displayName" type="text" value="${displayName}"/>
			<p class="help-text">Used when selecting field values. Could also be used in front-end facets.</p>
		</div>
		<div class="field">
			<button class="ui primary button" type="submit"><i class="save ui icon"></i>${value ? 'Modify' : 'Create'} field value ${displayName}</button>
		</div>
	</div>
</form>`;
}
