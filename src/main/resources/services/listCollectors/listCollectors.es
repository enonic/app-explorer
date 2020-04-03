//import {toStr} from '/lib/util';
import {RT_JSON} from '/lib/explorer/model/2/constants';
import {listCollectors} from '/lib/explorer/collector/listCollectors';
import {currentTimeMillis} from '/lib/explorer/time/currentTimeMillis';

/*const TEST_DATA = [{
	description: "Collect",
	id: "cba0d215-41a2-4b8c-8090-5363384c5499",
	name: "com.enonic.app.explorer.collector.web.crawler:collect",
	state: "RUNNING",
	application: "com.enonic.app.explorer.collector.web.crawler",
	user: "user:system:su",
	startTime: "2019-09-20T08:06:44.042412Z",
	progress: {
		info: {
			name: "example",
			message: "Initializing...",
			startTime: 1568966804066,
			currentTime: 1568966804070,
			uri: "https://www.example1.com/"
		},
		current: 0,
		total: 1
	}
},{
	description: "Collect",
	id: "whatever",
	name: "com.enonic.app.explorer.collector.web.crawler:collect",
	state: "FINISHED",
	application: "com.enonic.app.explorer.collector.web.crawler",
	user: "user:system:su",
	startTime: "2019-09-20T08:06:44.042412Z",
	progress: {
		info: {
			name: "example",
			message: "Finished with 0 errors.",
			startTime: 1568966804066,
			currentTime: 1568966805876,
			uri: "https://www.example2.com/"
		},
		current: 2,
		total: 2
	}
}];*/

export const get = () => ({
	contentType: RT_JSON,
	body: /*TEST_DATA*/listCollectors().map(task => {
		//log.info(`task:${toStr(task)}`);
		try {
			// If a task fails in a uncontrolled way task.progress.info is just a string, not json.
			task.progress.info = JSON.parse(task.progress.info);
			if (!task.progress.info.currentTime) {
				log.info('Setting new currentTime');
				task.progress.info.currentTime = currentTimeMillis();
			}
			if (!task.progress.info.startTime) {
				log.info('Setting new startTime');
				task.progress.info.startTime = task.progress.info.currentTime;
			}
			return task;
		} catch (e) {
			//log.error(toStr({task})); // Since status polls once a second this spams the log!
			return null;
		}
	}).filter(x => x)
});
