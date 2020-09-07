import {list} from '/lib/cron';
import {RT_JSON} from '/lib/explorer/model/2/constants';

export const get = () => ({
	body: list(),
	contentType: RT_JSON
});
