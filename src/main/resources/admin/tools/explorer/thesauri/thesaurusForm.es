import {TOOL_PATH} from '/lib/explorer/model/2/constants';


export function thesaurusForm({
	description = '',
	displayName = '',
	name,
	action = name ? `${TOOL_PATH}/thesauri/update/${name}` : `${TOOL_PATH}/thesauri/create`
} = {}) {
	return `<form
	action="${action}"
	autocomplete="off"
	class="ui form"
	method="POST"
	style="width: 100%;"
>
	<div class="ui header">Thesaurus</div>
	<div class="grouped fields">
		<div class="field">
			<label>Name</label>
			<input name="name" ${name ? 'readonly ' : ''} type="text"/>
		</div>
		<div class="field">
			<label>Display name</label>
			<input name="displayName" type="text" value="${displayName}"/>
		</div>
		<div class="field">
			<label>Description</label>
			<input name="description" type="text" value="${description}"/>
		</div>
		<div class="field">
			<button class="ui button" type="submit"><i class="green plus icon"></i> ${name ? 'Modify' : 'Create'} thesaurus</button>
		</div>
	</div>
</form>`
} // thesaurusForm
