import type {ApplicationEventData} from '@enonic/js-utils/types/Event.d';


// import {toStr} from '@enonic/js-utils';
import {list as getApplications} from '/lib/explorer/application';
import {runAsSu} from '/lib/explorer/runAsSu';
import {listener} from '/lib/xp/event';
import {createFromDocumentTypesJson} from './createFromDocumentTypesJson';

//import {EVENT_INIT_COMPLETE} from './init'; // Avoid two way import!


const EVENT_TYPE_APPLICATION = 'application';

//const EVENT_TYPE_CUSTOM_EXPLORER_INIT_COMPLETE = `${EVENT_TYPE_PREFIX_CUSTOM}.${EVENT_INIT_COMPLETE}`;

const EVENT_TYPE_APPLICATION_EVENT_TYPE_STARTED = 'STARTED';


export function applicationListener() {
	const startedNonSytemApps = getApplications({
		filterOnIsStartedEquals: true,
		filterOnIsSystemEquals: false
	});
	startedNonSytemApps.forEach((appKey) => {
		createFromDocumentTypesJson({
			applicationKey: appKey as string
		});
	});
	// listener({
	// 	type: '*',
	// 	localOnly: false,
	// 	callback: (event) => {
	// 		const {type} = event;
	// 		if (!EVENT_TYPE_TASKS.concat(
	// 			EVENT_TYPE_APPLICATION,
	// 			EVENT_TYPE_CUSTOM_EXPLORER_INIT_COMPLETE
	// 		).includes(type)) {
	// 			log.info(`event:${toStr(event)}`);
	// 		}
	// 	}
	// });
	listener<ApplicationEventData>({
		type: EVENT_TYPE_APPLICATION,
		localOnly: false,
		callback: (event) => {
			const {
				applicationKey,
				eventType,
				systemApplication
			} = event.data;
			if (
				!systemApplication
				&& eventType === EVENT_TYPE_APPLICATION_EVENT_TYPE_STARTED
			) {
				//log.info(`Application:${applicationKey} potentially with collector(s) started!`);
				runAsSu(() => { // Fix for BUG #590 documentTypes.json from external collector app fails to install
					createFromDocumentTypesJson({
						applicationKey
					});
				}); // runAsSu
			} // if
		} // callback
	}); // listener
} // applicationListener
