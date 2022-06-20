import type {CollectionNode} from '/lib/explorer/types/Collection.d';


import {forceArray} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getCollectionIds} from '/lib/explorer/collection/getCollectionIds';
import {get as getInterface} from '/lib/explorer/interface/get';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';


export function getInterfaceInfo({
	interfaceName
} :{
	interfaceName :string
}) {
	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});

	const filteredInterfaceNode = coerseInterfaceType(interfaceNode);

	const {
		fields = [],// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords//,
		//synonyms // TODO
	} = filteredInterfaceNode;

	let {
		collectionIds,
	} = filteredInterfaceNode;

	if (interfaceName === 'default' ) {
		// The default interface has no collectionIds, so get all collectionIds:
		collectionIds = getCollectionIds({
			connection: explorerRepoReadConnection
		});
	}

	const collectionIdsWithNames = forceArray(
		explorerRepoReadConnection.get<CollectionNode>(...collectionIds) as CollectionNode
	)
		.map(({_id, _name}) => ({_id, _name}));

	//const collectionIdToName :Record<string,string> = {};
	const collectionNameToId :Record<string,string> = {};
	for (let i = 0; i < collectionIdsWithNames.length; i++) {
	    const {_id, _name} = collectionIdsWithNames[i];
		//collectionIdToName[_id] = _name;
		collectionNameToId[_name] = _id;
	}

	return {
		collectionNameToId,
		fields,
		stopWords
	};
} // getInterfaceInfo
