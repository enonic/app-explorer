import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';


export function toolPage({
	path
}) {
	return htmlResponse({
		main: '',
		path
	});
}
