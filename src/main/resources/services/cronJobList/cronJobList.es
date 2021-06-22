import {list} from '/lib/cron';
import {RT_JSON} from '/lib/explorer/model/2/constants';

// TODO Remove in app-explorer-2.0.0
export function get() {
	log.warning(`Deprecated: Use /lib/xp/scheduler instead of /lib/cron`);
	return {
		body: list(),
		contentType: RT_JSON
	};
}
