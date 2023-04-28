import type {
	//Notifications,
	NotificationsNode,
	NotificationsNodeCreateParams,
	NotificationsNodeSpecific
} from '@enonic-types/lib-explorer';


import {
	RESPONSE_TYPE_JSON,
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {get as getNode} from '/lib/explorer/node/get';


export function get() {
	const node = getNode<NotificationsNode>({
		connection: connect({
			principals: [PRINCIPAL_EXPLORER_READ]
		}),
		path: '/notifications'
	}) || {} as NotificationsNode;
	//log.info(toStr({node}));

	const {emails = []} = node;
	//log.info(toStr({emails}));

	return {
		contentType: RESPONSE_TYPE_JSON,
		body: {
			emails: forceArray(emails)
		}
	};
} // get


export function post({
	params: {
		json// = JSON.stringify({emails: []})
	}
}) {
	//if (!json) { missing required param}
	//log.info(`json:${toStr(json)}`);

	try {
		const obj = JSON.parse(json) as NotificationsNodeSpecific;
		//log.info(`obj:${toStr(obj)}`);

		const {emails = []} = obj;
		//log.info(`emails:${toStr(emails)}`);

		createOrModify<NotificationsNodeCreateParams>({
			emails,
			_name: 'notifications'
		}, {
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			})
		});

		return {
			contentType: RESPONSE_TYPE_JSON,
			status: 200
		};
	} catch (e) {
		return {
			contentType: RESPONSE_TYPE_JSON,
			status: 500
		};
	} // try ... catch
} // post
