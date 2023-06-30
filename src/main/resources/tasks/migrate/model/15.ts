import type {WriteConnection} from '@enonic-types/lib-explorer';
import type { Progress } from '../../init/Progress';


import {setModel} from '/lib/explorer/model/setModel';
import {get as getInterface} from '/lib/explorer/interface/get';
import {update as updateInterface} from '/lib/explorer/interface/update';
import {
	DEFAULT_INTERFACE,
	DEFAULT_INTERFACE_NAME
} from '../interfaceDefault';


export function model15({
	progress,
	writeConnection
}: {
	progress: Progress
	writeConnection: WriteConnection
}) {
	progress.addItems(1).setInfo('Updating default interface with fields _alltext ...').report().logInfo();
	const existingInterfaceNode = getInterface({
		connection: writeConnection,
		interfaceName: DEFAULT_INTERFACE_NAME
	});
	updateInterface({
		_id: existingInterfaceNode._id,
		collectionIds: DEFAULT_INTERFACE.collectionIds,
		fields: DEFAULT_INTERFACE.fields,
		stopWords: DEFAULT_INTERFACE.stopWords,
		synonymIds: DEFAULT_INTERFACE.synonymIds
	}, {
		writeConnection
	});
	progress.finishItem();
	setModel({
		connection: writeConnection,
		version: 15
	});
}
