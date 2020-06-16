import {toStr} from '/lib/util';
import {
	addToGroup,
	removeFromGroup,
	send,
	sendToGroup
} from '/lib/xp/websocket';


export function get(request) {
	log.info(`request:${toStr(request)}`);
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
	log.info(`event:${toStr(event)}`);

	const {
		message,
		//session,
		session: {
			id: sessionId
		},
		type
	} = event;
	log.info(`message:${toStr(message)}`);
	//log.info(`session:${toStr(session)}`);
	log.info(`sessionId:${toStr(sessionId)}`);
	log.info(`type:${toStr(type)}`);

	switch (type) {
	case 'open':
		send(sessionId, 'Welcome to our chat');
		addToGroup('chat', sessionId);
		break;
	case 'message':
		sendToGroup('chat', message);
		break;
	case 'close':
		removeFromGroup('chat', sessionId);
		break;
	default:
		log.error(`unhandeled websocket event type:${type}`);
	}
} // webSocketEvent
