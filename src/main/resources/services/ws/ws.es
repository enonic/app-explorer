import {execute} from '/lib/graphql';
import {validateLicense} from '/lib/license';
import {toStr} from '/lib/util';
import {listener} from '/lib/xp/event';
import {
	addToGroup,
	removeFromGroup,
	send,
	sendToGroup
} from '/lib/xp/websocket';

import {SCHEMA} from '../graphQL/graphQL';
//import {queryCollectionsResolver} from '../graphQL/collection';


const WEBSOCKET_GROUP = 'subscribers';

const COLLECTIONS_GQL = `queryCollections {
	total
	count
	page
	pageStart
	pageEnd
	pagesTotal
	hits {
		_id
		_name
		_path
		collector {
			name
			configJson
		}
		cron {
			month
			dayOfMonth
			dayOfWeek
			hour
			minute
		}
		displayName
		doCollect
		documentCount
		interfaces
		type
	}
}`;

const COLLECTORS_GQL = `queryCollectors {
	total
	count
	hits {
		_id
		_path
		_name
		appName
		collectTaskName
		configAssetPath
		displayName
		type
	}
}`;

const CONTENT_TYPES_GQL = `getContentTypes {
	abstract
	allowChildContent
	description
	displayName
	final
	formJson
	icon {
		mimeType
		modifiedTime
	}
	name
	#superType
}`;

const FIELDS_GQL = `queryFields {
	total
	count
	hits {
		_id
		_name
		_path
		denyDelete
		denyValues
		displayName
		indexConfig
		inResults
		fieldType
		key
		type
		values {
			_id
			_name
			_path
			displayName
			field
			fieldReference
			type
			value
		}
	}
}`;

const SITES_GQL = `getSites {
	total
	count
	hits {
		_id
		_name
		_path
		displayName
	}
}`;


const TASKS_GQL = `queryTasks {
	application
	description
	id
	name
	progress {
		current
		info
		total
	}
	startTime
	state
	user
}`;


const ALL_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${CONTENT_TYPES_GQL}
	${FIELDS_GQL}
	${SITES_GQL}
	${TASKS_GQL}
}`;

const NULL = null;


export function get(request) {
	//log.info(`request:${toStr(request)}`);
	const {webSocket} = request;
	//log.info(`webSocket:${toStr(webSocket)}`);
	if (!webSocket) {
		return {
			status: 404
		};
	}

	return {
		webSocket: {
			data: {
				user: 'test'
			},
			subProtocols: ['text']
		}
	};
} // get


export function webSocketEvent(event) {
	//log.info(`event:${toStr(event)}`);

	const {
		message,
		//session,
		session: {
			id: sessionId
		},
		type
	} = event;
	//log.info(`message:${toStr(message)}`);
	//log.info(`session:${toStr(session)}`);
	//log.info(`sessionId:${toStr(sessionId)}`);
	//log.info(`type:${toStr(type)}`);

	switch (type) {
	case 'open':
		//send(sessionId, 'websocket open');
		break;
	case 'message':
		switch (message) {
		case 'ping':
			//log.info(`Received ping from ${sessionId}`);
			// Respond so that client will send new keep-alive in 30 seconds.
			send(sessionId, JSON.stringify({
				type: 'pong'
			}));
			break;
		case 'subscribe':
			addToGroup(WEBSOCKET_GROUP, sessionId);
			//log.info(`ALL_GQL:${ALL_GQL}`);
			// NOTE https://stackoverflow.com/questions/22034824/websocket-not-able-to-send-receive-string-longer-than-65536-characters
			send(sessionId, JSON.stringify({
				type: 'initialize',
				data: execute(SCHEMA, ALL_GQL, NULL)
			}));
			//send(sessionId, JSON.stringify(queryCollectionsResolver()));
			break;
		case 'unsubscribe':
			removeToGroup(WEBSOCKET_GROUP, sessionId);
			//send(sessionId, 'unsubscribed');
			break;
		case 'tasks':
			send(sessionId, JSON.stringify({
				type: 'tasks',
				data: execute(SCHEMA, `{
					${TASKS_GQL}
				}`, NULL)
			}));
			break;
		default:
			log.error(`unhandeled websocket message:${message}`);
		}
		break;
	case 'close':
		removeFromGroup(WEBSOCKET_GROUP, sessionId);
		//send(sessionId, 'websocket closed'); // Not received on client
		break;
	default:
		log.error(`unhandeled websocket event event:${toStr(event)}`);
	}
} // webSocketEvent


//https://www.npmjs.com/package/jiff
//https://www.npmjs.com/package/bsdp
//https://www.npmjs.com/package/bitowl

let colletorsState = execute(SCHEMA, `{
	${COLLECTORS_GQL}
}`, NULL);

// NOTE https://github.com/enonic/doc-xp/issues/153
// For your use-case create two listeners: node.* and task.*
// In case you are not interested in node.push, filter it out in listener itself
// If you really want magic, subscribe to * and do a filtering in js code.
// It may be even more optimal for overall system throughput.

//log.info('Starting to listen for changes to collections');
listener({
	type: 'node.*',
	localOnly: false,
	callback: (event) => {
		//log.info(`event:${toStr(event)}`);
		const {
			data: {
				nodes
			},
			//distributed,
			//localOrigin,
			//timestamp,
			type
		} = event;
		if (['node.created','node.updated','node.deleted'].includes(type)) {
			nodes.forEach((node, i) => {
				//log.info(`node:${toStr(node)}`);
				const {id, path, branch, repo} = node;
				if (branch === 'master') {
					if (repo === 'com.enonic.app.explorer') {
						if (path.startsWith('/collections/')) {
							// NOTE https://github.com/enonic/xp/issues/8163 lib-websocket.getGroupCount('groupName')
							sendToGroup(WEBSOCKET_GROUP, JSON.stringify({
								type: 'collections',
								data: execute(SCHEMA, `{
									${COLLECTIONS_GQL}
								}`, NULL)
							}));
						} else if (path.startsWith('/collectors/')) {
							colletorsState = execute(SCHEMA, `{
								${COLLECTORS_GQL}
							}`, NULL);
							sendToGroup(WEBSOCKET_GROUP, JSON.stringify({
								type: 'collectors',
								data: colletorsState
							}));
						} else if (path.startsWith('/fields/')) {
							// fields...
							// fieldvalues...
							sendToGroup(WEBSOCKET_GROUP, JSON.stringify({
								type: 'fields',
								data: execute(SCHEMA, `{
									${FIELDS_GQL}
								}`, NULL)
							}));
						} else if (path.startsWith('/interfaces/')) {
							//...
						} else if (path.startsWith('/stopwords/')) {
							//...
						} else if (path.startsWith('/thesauri/')) {
							// thesauri...
							// synonym... // Too much data to sync to client
						}
					} else if (repo === 'system-repo') {
						if (path === '/licenses/com.enonic.app.explorer') {
							const licenseDetails = validateLicense({appKey: app.name});
							//log.info(`licenseDetails:${toStr(licenseDetails)}`);
							const licenseValid = !!(licenseDetails && !licenseDetails.expired);
							//log.info(`licenseValid:${toStr(licenseValid)}`);
							const licensedTo = licenseDetails ? `Licensed to ${licenseDetails.issuedTo}` : 'Unlicensed';
							sendToGroup(WEBSOCKET_GROUP, JSON.stringify({
								type: 'license',
								data: {
									licensedTo,
									licenseValid
								}
							}));
						}
					}
					 /*else if (repo.startsWith('com.enonic.app.explorer.')) {
						// document counts?
					}*/
					// contenttypes?
					// sites?
				}
			});
		}
	} // callback
}); // listener


// NOTE The problem is that a collector task, can be in any app and have any name and any description.
// Thus I have to look at the info object to determine whether this is a collector task
// Submitted has no info
// Info also doesn't currently provide any thing saying this is a collector :(
// Solution: Get list of collector tasks from registered collectors.
// TODO What are the relevant task "states"
// TODO Send full list of relevant task "states" on any change?
// TODO This data can be useful on the status page too.
// TODO But only send such data when visible on screen???
/*listener({
	type: 'task.*',
	localOnly: false,
	callback: (event) => {
		//log.info(`event:${toStr(event)}`);
		const {
			data,
			//distributed,
			//localOrigin,
			//timestamp,
			type
		} = event;
		//log.info(`event:${toStr(event)}`);
		//log.info(`data:${toStr(data)}`);
		log.info(`type:${toStr(type)}`);
		const {
			//description, // 'Collect'
			//id, // '07c2d09f-73e9-44ea-a732-6a54a0b4da3a'
			name, // 'com.enonic.app.explorer:webcrawl'
			state, // 'WAITING'
			progress: {
				info: infoMaybeJson//,
				//current, // 0
				//total // 0
			}//,
			//application, // 'com.enonic.app.explorer'
			//user, // 'user:system:su'
			//startTime // '2020-06-23T11:06:33.633010Z'
		} = data;
		log.info(`colletorsState:${toStr(colletorsState)}`);
		const {
			data: {
				queryCollectors: {
					hits
				}
			}
		} = colletorsState;
		hits.forEach(({appName, collectTaskName}) => {
			if (name === `${appName}:${collectTaskName}`) {
				// TODO Send what when???
				sendToGroup(WEBSOCKET_GROUP, JSON.stringify({
					type: 'collectorTask',
					data: {

					}
				}));
			}
		});
	} // callback
}); // listener*/

/*
const EXAMPLE_CREATE_EVENT = {
	type: 'node.created',
	timestamp: 1592465568317,
	localOrigin: true,
	distributed: true,
	data: {
		nodes: [
			{
				id: 'b23dbc9b-c31d-4757-9872-1b6e3bf3659a',
				path: '/collections/example1',
				branch: 'master',
				repo: 'com.enonic.app.explorer'
			}
		]
	}
};

const EXAMPLE_UPDATE_EVENT = {
	type: 'node.updated',
	timestamp: 1592465440915,
	localOrigin: true,
	distributed: true,
	data: {
		nodes: [
			{
				id: 'b376f7c3-a3cd-405c-b7f4-742a75a19fba',
				path: '/collections/example',
				branch: 'master',
				repo: 'com.enonic.app.explorer'
			}
		]
	}
}

const EXAMPLE_DELETE_EVENT = {
	type: 'node.deleted',
	timestamp: 1592465615149,
	localOrigin: true,
	distributed: true,
	data: {
		nodes: [
			{
				id: 'b23dbc9b-c31d-4757-9872-1b6e3bf3659a',
				path: '/collections/example1',
				branch: 'master',
				repo: 'com.enonic.app.explorer'
			}
		]
	}
};

const EXAMPLE_TASK_SUBMITTED_EVENT = {
	"type": "task.submitted",
	"timestamp": 1592910393633,
	"localOrigin": true,
	"distributed": true,
	"data": {
		"description": "Collect",
		"id": "07c2d09f-73e9-44ea-a732-6a54a0b4da3a",
		"name": "com.enonic.app.explorer:webcrawl",
		"state": "WAITING",
		"progress": {
			"info": "",
			"current": 0,
			"total": 0
		},
		"application": "com.enonic.app.explorer",
		"user": "user:system:su",
		"startTime": "2020-06-23T11:06:33.633010Z"
	}
};

const EXAMPLE_TASK_UPDATED_EVENT = {
	"type": "task.updated",
	"timestamp": 1592910395263,
	"localOrigin": true,
	"distributed": true,
	"data": {
		"description": "Collect",
		"id": "07c2d09f-73e9-44ea-a732-6a54a0b4da3a",
		"name": "com.enonic.app.explorer:webcrawl",
		"state": "RUNNING",
		"progress": {
			"info": "{\"name\":\"example\",\"message\":\"Finished with 0 errors.\",\"startTime\":1592910393658,\"currentTime\":1592910395263,\"uri\":\"https://www.example.com/\"}",
			"current": 1,
			"total": 1
		},
		"application": "com.enonic.app.explorer",
		"user": "user:system:su",
		"startTime": "2020-06-23T11:06:33.633010Z"
	}
};

const EXAMPLE_TASK_FINISHED_EVENT = {
	"type": "task.finished",
	"timestamp": 1592910395275,
	"localOrigin": true,
	"distributed": true,
	"data": {
		"description": "Collect",
		"id": "07c2d09f-73e9-44ea-a732-6a54a0b4da3a",
		"name": "com.enonic.app.explorer:webcrawl",
		"state": "FINISHED",
		"progress": {
			"info": "{\"name\":\"example\",\"message\":\"Finished with 0 errors.\",\"startTime\":1592910393658,\"currentTime\":1592910395263,\"uri\":\"https://www.example.com/\"}",
			"current": 1,
			"total": 1
		},
		"application": "com.enonic.app.explorer",
		"user": "user:system:su",
		"startTime": "2020-06-23T11:06:33.633010Z"
	}
};

const EXAMPLE_TASK_REMOVED_EVENT = {
	"type": "task.removed",
	"timestamp": 1592910477671,
	"localOrigin": true,
	"distributed": true,
	"data": {
		"description": "Collect",
		"id": "07c2d09f-73e9-44ea-a732-6a54a0b4da3a",
		"name": "com.enonic.app.explorer:webcrawl",
		"state": "FINISHED",
		"progress": {
			"info": "{\"name\":\"example\",\"message\":\"Finished with 0 errors.\",\"startTime\":1592910393658,\"currentTime\":1592910395263,\"uri\":\"https://www.example.com/\"}",
			"current": 1,
			"total": 1
		},
		"application": "com.enonic.app.explorer",
		"user": "user:system:su",
		"startTime": "2020-06-23T11:06:33.633010Z"
	}
};
*/
