import {isObject} from '@enonic/js-utils';

import {
	progress as reportProgress//,
	//sleep
	//@ts-ignore
} from '/lib/xp/task';


type Info = string | Object;


export class Progress {
	current :number
	info :string
	total :number

	constructor({
		current = 0,
		info = 'Initializing',
		//sleepMsAfterItem = 0,
		total = 1
	} = {}) {
		this.current = current;

		this.info = isObject(info) ? JSON.stringify(info) : info;
		//this.sleepMsAfterItem = sleepMsAfterItem;
		this.total = total;
	}

	/*setCurrent(current) {
		this.current = current;
		return this; // chainable
	}*/

	debug() {
		log.debug(`[${this.current}/${this.total}] ${this.info}`);
		return this; // chainable
	}

	logInfo() {
		log.info(`[${this.current}/${this.total}] ${this.info}`);
		return this; // chainable
	}

	getInfo() {
		let rv = this.info;
		try {
			rv = JSON.parse(this.info);
		} catch (e) {
			// no-op
		}
		return rv;
	}

	setInfo(info :Info) {
		this.info = isObject(info) ? JSON.stringify(info) : info;
		return this; // chainable
	}

	report() {
		reportProgress({
			current: this.current,
			info: this.info,
			total: this.total
		});
		return this; // chainable
	}

	addItems(count :number) {
		this.total += count;
		return this; // chainable
	}

	finishItem(info? :Info) {
		this.current += 1;
		if (info) {
			this.info = isObject(info) ? JSON.stringify(info) : info;
		}
		/*if (this.sleepMsAfterItem) {
			sleep(this.sleepMsAfterItem);
		}*/
		return this; // chainable
	}
} // class Progress
