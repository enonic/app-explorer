import type {AnyObject} from '/lib/explorer/types/index.d';


//import {toStr} from '@enonic/js-utils';
import {list as getApplications} from '/lib/explorer/application';
//@ts-ignore
import {listener} from '/lib/xp/event';
import {createFromDocumentTypesJson} from './createFromDocumentTypesJson';

//import {EVENT_INIT_COMPLETE} from './init'; // Avoid two way import!


const EVENT_TYPE_PREFIX_CUSTOM = 'custom';
const EVENT_TYPE_APPLICATION = 'application';
const EVENT_TYPE_TASK_FINISHED = 'task.finished';
const EVENT_TYPE_TASK_REMOVED = 'task.removed';
const EVENT_TYPE_TASK_UPDATED = 'task.updated';
/*const EVENT_TYPE_TASKS = [
	EVENT_TYPE_TASK_FINISHED,
	EVENT_TYPE_TASK_REMOVED,
	EVENT_TYPE_TASK_UPDATED
];*/

//const EVENT_TYPE_CUSTOM_EXPLORER_INIT_COMPLETE = `${EVENT_TYPE_PREFIX_CUSTOM}.${EVENT_INIT_COMPLETE}`;

const EVENT_TYPE_APPLICATION_EVENT_TYPE_STARTED = 'STARTED';

//type EventTypePrefixNode = 'node';
//type EventTypePrefixTask = 'task';
type EventTypeApplication = typeof EVENT_TYPE_APPLICATION;
type EventTypeTaskFinished = typeof EVENT_TYPE_TASK_FINISHED;
type EventTypeTaskRemoved = typeof EVENT_TYPE_TASK_REMOVED;
type EventTypeTaskUpdated = typeof EVENT_TYPE_TASK_UPDATED;
type EventTypesCustom = `${typeof EVENT_TYPE_PREFIX_CUSTOM}.${string}`;
type EventTypesTask = EventTypeTaskFinished | EventTypeTaskRemoved | EventTypeTaskUpdated;
type EventTypes = EventTypeApplication | EventTypesTask | EventTypesCustom;

type Event<
	Type extends EventTypes,
	Data extends AnyObject
	> = {
	data :Data
	distributed :boolean
	localOrigin :boolean
	timestamp :number
	type :Type,
}

type ApplicationEvent = Event<EventTypeApplication,{
	applicationKey :string
	systemApplication :boolean
	eventType :string //'INSTALLED'|'STARTED'
}>;

//type CustomEvent = Event<EventTypesCustom,AnyObject>;

//type GenericEvent = Event<EventTypes,AnyObject>;

/*type TaskEvent = Event<EventTypesTask,{
	application :string
	description :string
	id :string
	name :string
	progress :{
		current :number
		info :string
		total :number
	}
	startTime :string // Date
	state :string //'FINISHED'
	user :string
}>;*/

//type Events = ApplicationEvent|TaskEvent|CustomEvent//|GenericEvent




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
	/*listener({
		type: '*',
		localOnly: false,
		callback: (event :Events) => {
			const {type} = event;
			if (!EVENT_TYPE_TASKS.concat(
				EVENT_TYPE_APPLICATION,
				EVENT_TYPE_CUSTOM_EXPLORER_INIT_COMPLETE
			).includes(type)) {
				log.info(`event:${toStr(event)}`);
			}
		}
	});*/
	listener({
		type: EVENT_TYPE_APPLICATION,
		localOnly: false,
		callback: (event :ApplicationEvent) => {
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
				createFromDocumentTypesJson({
					applicationKey
				});
			}
		}
	});
}
