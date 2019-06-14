import {toStr} from '/lib/util';
import {RT_JSON} from '/lib/explorer/model/2/constants';
import {listCollectors} from '/lib/explorer/collector/listCollectors';
import {currentTimeMillis} from '/lib/explorer/time/currentTimeMillis';


export const get = () => ({
	contentType: RT_JSON,
	body: listCollectors().map(task => {
		task.progress.info = JSON.parse(task.progress.info);
		//log.info(toStr({task}));
		if (!task.progress.info.currentTime) {
			log.info('Setting new currentTime');
			task.progress.info.currentTime = currentTimeMillis();
		}
		if (!task.progress.info.startTime) {
			log.info('Setting new startTime');
			task.progress.info.startTime = task.progress.info.currentTime;
		}
		return task;
	})
});
