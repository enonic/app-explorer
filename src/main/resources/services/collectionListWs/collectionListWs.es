import {execute} from '/lib/graphql';
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


const WEBSOCKET_GROUP_COLLECTIONS = 'collections';


const GRAPHQL_QUERY = `{
	queryCollections {
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
			collecting
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
	}
}`;
const GRAPHQL_VARIABLES = null;


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
		case 'subscribe':
			addToGroup(WEBSOCKET_GROUP_COLLECTIONS, sessionId);
			// NOTE https://stackoverflow.com/questions/22034824/websocket-not-able-to-send-receive-string-longer-than-65536-characters
			send(sessionId, JSON.stringify(execute(SCHEMA, GRAPHQL_QUERY, GRAPHQL_VARIABLES)));
			//send(sessionId, JSON.stringify(queryCollectionsResolver()));
			break;
		case 'unsubscribe':
			removeToGroup(WEBSOCKET_GROUP_COLLECTIONS, sessionId);
			//send(sessionId, 'unsubscribed');
			break;
		default:
			log.error(`unhandeled websocket message:${message}`);
		}
		break;
	case 'close':
		removeFromGroup(WEBSOCKET_GROUP_COLLECTIONS, sessionId);
		//send(sessionId, 'websocket closed'); // Not received on client
		break;
	default:
		log.error(`unhandeled websocket event event:${toStr(event)}`);
	}
} // webSocketEvent


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
			distributed,
			localOrigin,
			timestamp,
			type
		} = event;
		if (['node.created','node.updated','node.deleted'].includes(type)) {
			nodes.forEach((node, i) => {
				//log.info(`node:${toStr(node)}`);
				const {id, path, branch, repo} = node;
				if (
					repo === 'com.enonic.app.explorer' &&
					branch === 'master' &&
					path.startsWith('/collections/')
				) {
					// NOTE https://github.com/enonic/xp/issues/8163 lib-websocket.getGroupCount('groupName')
					sendToGroup(WEBSOCKET_GROUP_COLLECTIONS, JSON.stringify(execute(SCHEMA, GRAPHQL_QUERY, GRAPHQL_VARIABLES)));
					//sendToGroup(WEBSOCKET_GROUP_COLLECTIONS, JSON.stringify(queryCollectionsResolver()));
				}
			});
		}
	}
});
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
*/
