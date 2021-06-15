import {
	progress as reportProgress//,
	//sleep
} from '/lib/xp/task';

export class Progress {
	constructor({
		current = 0,
		info = 'Initializing',
		//sleepMsAfterItem = 0,
		total = 1
	} = {}) {
		this.current = current;
		this.info = info;
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

	info() {
		log.info(`[${this.current}/${this.total}] ${this.info}`);
		return this; // chainable
	}

	setInfo(info) {
		this.info = info;
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

	addItems(count) {
		this.total += count;
		return this; // chainable
	}

	finishItem(info) {
		this.current += 1;
		if (info) {
			this.info = info;
		}
		/*if (this.sleepMsAfterItem) {
			sleep(this.sleepMsAfterItem);
		}*/
		return this; // chainable
	}
} // class Progress
