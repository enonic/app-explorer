//import {toStr} from '/lib/util';


import {setTimeout} from '../../lib/setTimeout';


const TimeUnit = Java.type('java.util.concurrent.TimeUnit');


const REQUEST_TIMEOUT = 30000; // 30 seconds is default in firefox.


export const get = (/*request*/) => {
	//log.info(`request:${toStr(request)}`);

	let wait = true;
	setTimeout(() => {
		wait = false;
	}, REQUEST_TIMEOUT);

	try {
		while (wait) {
			//log.info('Sleeping for 1 second');
			TimeUnit.SECONDS.sleep(1);
			//log.info('Slept for 1 second');
		} // while
	} catch (e) {
		log.warning('Sleep interupted!');
	}
	//log.info('3 seconds later :)');
	return {
		body: { key: 'later?'},
		contentType: 'application/json;charset=utf-8'
	}; // return
}; // get
