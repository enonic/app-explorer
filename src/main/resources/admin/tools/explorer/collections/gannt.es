import {assetUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


export function gannt({
	params: {
		messages,
		status
	},
	path
}) {
	const readConnection = connect({principals: PRINCIPAL_EXPLORER_READ});
	return htmlResponse({
		main: `
<script src="${assetUrl({path: 'frappe-gantt/frappe-gantt.min.js'})}" />
<svg id="gantt"></svg>
<script>
var tasks = [
  {
    id: 'Task 1',
    name: 'Redesign website',
    start: '2016-12-28',
    end: '2016-12-31',
    progress: 20,
    dependencies: 'Task 2, Task 3'
  }
];
var gantt = new Gantt("#gantt", tasks);
</script>
`,
		messages,
		path,
		status,
		title: 'Gannt'
	});
} // function gannt
