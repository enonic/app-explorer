import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';

import {TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';
import {insertAdjacentHTML} from '/lib/enonic/yase/admin/insertAdjacentHTML';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';


export function editSynonymPage({
	path
}, {
	toolPath = TOOL_PATH,
	relPath = path.replace(toolPath, ''),
	pathParts = relPath.match(/[^/]+/g),
	thesaurusName = pathParts[1],
	synonymId = pathParts[2],
	connection = connectRepo()
} = {}) {
	log.info(toStr({
		path, relPath, pathParts, synonymId
	}));

	const node = connection.get(synonymId);
	log.info(toStr({node}));

	const {displayName, from, to} = node;
	log.info(toStr({displayName, from, to}));

	const fromInput = '<input class="block" name="from" type="text"/>';
	const toInput = '<input class="block" name="to" type="text"/>';

	return htmlResponse({
		main: `<form action="${toolPath}/thesauri/${thesaurusName}" autocomplete="off" method="POST">
	<fieldset>
		<legend>Edit synonym ${displayName}</legend>
		<input name="id" type="hidden" value="${synonymId}"/>
		<label>
			<span>From</span>
			${forceArray(from).map(value => `<input class="block" name="from" type="text" value="${value}"/>`).join('\n')}
			<button type="button" onClick="${insertAdjacentHTML(fromInput)}">+</button>
		</label>
		<label>
			<span>To</span>
			${forceArray(to).map(value => `<input class="block" name="to" type="text" value="${value}"/>`).join('\n')}
			<button type="button" onClick="${insertAdjacentHTML(toInput)}">+</button>
		</label>
		<button type="submit">Update synonym</button>
	</fieldset>
</form>`,
		path,
		title: `Edit synonym ${displayName}`
	});
}
