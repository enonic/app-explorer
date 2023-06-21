import type {AnyObject} from '../../types/index.d';


import {isObject} from '@enonic/js-utils';

import {
	progress as reportProgress//,
	//sleep
	//@ts-ignore
} from '/lib/xp/task';


//type Info = string | AnyObject;


export class Progress<Info extends string|AnyObject = string> {
	current: number
	info: Info
	total: number

	constructor({
		current = 0,
		info = 'Initializing',
		//sleepMsAfterItem = 0,
		total = 1
	}: {
		current?: number
		info?: string|AnyObject
		total?: number
	} = {}) {
		this.current = current;

		this.info = info as Info;
		//this.sleepMsAfterItem = sleepMsAfterItem;
		this.total = total;
	}

	/*setCurrent(current) {
		this.current = current;
		return this; // chainable
	}*/

	getInfoString() {
		return isObject(this.info) ? JSON.stringify(this.info) : this.info;
	}

	debug() {
		log.debug(`[${this.current}/${this.total}] ${this.getInfoString()}`);
		return this; // chainable
	}

	logInfo() {
		log.info(`[${this.current}/${this.total}] ${this.getInfoString()}`);
		return this; // chainable
	}

	getInfo() {
		return this.info;
	}

	setInfo(info: Info) {
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

	addItems(count: number) {
		this.total += count;
		return this; // chainable
	}

	finishItem(info?: Info) {
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
