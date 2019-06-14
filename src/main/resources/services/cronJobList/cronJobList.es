import {RT_JSON} from '/lib/explorer/model/2/constants';
import {list} from '/lib/cron';


export function get() {
	return {
		body: list(),
		contentType: RT_JSON
	};
}
