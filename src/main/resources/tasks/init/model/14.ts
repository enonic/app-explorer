import type {RepoConnection} from '/lib/explorer/types/index.d';


import {
	//addQueryFilter,
	sortByProperty//,
	//toStr
} from '@enonic/js-utils';
import deepEqual from 'fast-deep-equal';

import {
	APP_EXPLORER,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE,
	ROOT_PERMISSIONS_EXPLORER
} from '/lib/explorer/index';
import {setModel} from '/lib/explorer/model/setModel';
//import {hasValue} from '/lib/explorer/query/hasValue';
import {
	connect,
	list,
	multiConnect
} from '/lib/explorer/repo';
import {Progress} from '../Progress';

// _inheritsPermissions: false and _permissions: EXPLORER

export function model14({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	progress.addItems(1).setInfo('Finding nodes with _inheritsPermissions:true').report().logInfo();

	const sources = list({ idStartsWith: APP_EXPLORER }).map(({id}) => ({
		branch: 'master',
		principals: [PRINCIPAL_EXPLORER_READ],
		repoId: id
	}));
	//log.debug('sources:%s', toStr(sources));

	const multiReadConnection = multiConnect({
		sources
	});

	const queryParams = {
		count: -1, // total: 48
		/*filters: addQueryFilter({
			//filter: hasValue('_inheritsPermissions', [true]) // total: 0
			clause: 'mustNot',
			filter: hasValue('_permissions', [
				ROOT_PERMISSIONS_EXPLORER
			]) // total: 48
		}),*/
		query: ''
	};
	//log.debug('queryParams:%s', toStr(queryParams));

	const multiQueryRes = multiReadConnection.query(queryParams);
	//log.debug('multiQueryRes:%s', toStr(multiQueryRes));

	progress.addItems(multiQueryRes.total);
	progress.finishItem();

	multiQueryRes.hits.forEach(({
		id :nodeId,
		repoId
	}) => {
		progress.setInfo(`Making sure _inheritsPermissions: false and _permissions: ROOT_PERMISSIONS_EXPLORER repoId:${repoId} nodeId:${nodeId}`).report().logInfo();
		const writeConnection = connect({
			principals: [PRINCIPAL_EXPLORER_WRITE],
			repoId
		});
		const node = writeConnection.get(nodeId);

		let modify = false;

		if (node._inheritsPermissions) {
			modify = true;
		}

		if (!deepEqual(
			sortByProperty(node._permissions, 'principal'),
			sortByProperty(ROOT_PERMISSIONS_EXPLORER, 'principal')
		)) {
			modify = true;
		}

		if (modify) {
			//log.debug('modifying nodeId:%s', nodeId);
			//log.debug('node:%s', toStr(node));
			writeConnection.modify({
				key: nodeId,
				editor: (nodeToModify) => {
					nodeToModify._inheritsPermissions = false;
					nodeToModify._permissions = ROOT_PERMISSIONS_EXPLORER
					return nodeToModify;
				}
			});
		}

		progress.finishItem();
	}); // forEach
	setModel({
		connection: writeConnection,
		version: 14
	});
}
