import {TOOL_PATH} from '/lib/enonic/yase/admin/constants';


export function fieldFormHtml({
	displayName = '',
	key = ''
} = {}) {
	return `<form action="${TOOL_PATH}/fields" autocomplete="off" method="POST">
	<fieldset>
		<legend>New field</legend>

		<label>
			<span>Display name</span>
			<input name="displayName" ${displayName ? 'readonly ' : ''}type="text" value="${displayName}"/>
		</label>

		<label>
			<span>Key</span>
			<input name="key" ${key ? 'readonly ' : ''}type="text" value="${key}"/>
		</label>

		<label>
			<span>Description</span>
			<input name="description" type="text"/>
		</label>

		<!--label>
			<span>Icon url</span>
			<input name="iconUrl" type="text"/>
		</label-->

		<label>
			<span>Instruction</span>
			<select name="instruction">
				<option value="type" selected>type (default) - Indexing is done based on type; e.g numeric values are indexed as both string and numeric.</option>
				<option value="minimal">minimal - Value is indexed as a string-value only, no matter what type of data.</option>
				<option value="none">none - Value is not indexed.</option>
				<option value="fulltext">fulltext - Values are stored as ‘ngram’, ‘analyzed’ and also added to the _allText-field</option>
				<option value="path">path - Values are stored as ‘path’ type and applicable for the pathMatch-function</option>
				<option value="custom">custom - use settings below</option>
			</select>
		</label>

		<label>
			<span>decideByType</span>
			<input name="decideByType" type="checkbox" checked/>
		</label>

		<label>
			<span>enabled</span>
			<input name="enabled" type="checkbox" checked/>
		</label>

		<label>
			<span>nGram</span>
			<input name="nGram" type="checkbox" checked/>
		</label>

		<label>
			<span>fulltext</span>
			<input name="fulltext" type="checkbox" checked/>
		</label>

		<label>
			<span>includeInAllText</span>
			<input name="includeInAllText" type="checkbox" checked/>
		</label>

		<label>
			<span>path</span>
			<input name="path" type="checkbox"/>
		</label>

		<label>
			<span>Comment</span>
			<input name="comment" type="text"/>
		</label>

		<button type="submit">Add field</button>
	</fieldset>
</form>`;
}
