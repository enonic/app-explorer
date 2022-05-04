import type {
	OneOrMore,
	RepoConnection
} from '/lib/explorer/types/index.d';


import {
	addQueryFilter,
	forceArray
} from '@enonic/js-utils';
import {
	NT_COLLECTION,
	NT_INTERFACE
} from '/lib/explorer/index';
import {setModel} from '/lib/explorer/model/setModel';
import {hasValue} from '/lib/explorer/query/hasValue';
//@ts-ignore
import {reference} from '/lib/xp/value';
import {Progress} from '../Progress';


type InterfaceNodeWithCollections = /*InterfaceNode &*/ {
	collectionIds? :Array<string>
	collections? :OneOrMore<string>
}



export function model11({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	progress.addItems(1).setInfo('Finding interfaces with collections...').report().logInfo();
	const getAllCollectionsQueryParams = {
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_COLLECTION]),
			filters: {}
		}),
		query: ''
	};
	//log.debug(`getAllCollectionsQueryParams:${toStr(getAllCollectionsQueryParams)}`);

	const allCollectionsRes = writeConnection.query(getAllCollectionsQueryParams);
	//log.debug(`allCollectionsRes:${toStr(allCollectionsRes)}`); // HUGE

	const allCollections = allCollectionsRes.hits
		.map(({id}) => writeConnection.get(id))
		.map(({_id, _name}) => ({_id, _name}));
	//log.debug(`allCollections:${toStr(allCollections)}`);

	const collectionNameToIdObj = {};
	allCollections.forEach(({_id, _name}) => {
		collectionNameToIdObj[_name] = _id;
	});
	//log.debug(`collectionNameToIdObj:${toStr(collectionNameToIdObj)}`);

	const interfacesWithCollectionsQueryParams = {
		count: -1,
		filters: addQueryFilter({
			filter: {
				exists: { field: 'collections'}
			},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	};
	//log.debug(`interfacesWithCollectionsQueryParams:${toStr(interfacesWithCollectionsQueryParams)}`);

	const interfaceIds = writeConnection.query(interfacesWithCollectionsQueryParams).hits.map(({id}) => id);
	//log.debug(`interfaceIds:${toStr(interfaceIds)}`);

	progress.addItems(interfaceIds.length); // .setInfo(`Found ${interfaceIds.length} interfaces with collections.`)
	progress.finishItem(); // .setInfo('Done finding interfaces with collections.')

	interfaceIds.forEach((interfaceId) => {
		progress.setInfo(`Converting collections -> collectionIds in interfaceId:${interfaceId}`).report().logInfo();
		writeConnection.modify<InterfaceNodeWithCollections>({
			key: interfaceId,
			editor: (interfaceNode) => {
				//log.debug(`(in) collectionIdReferences:${toStr(interfaceNode.collectionIds)}`); // Oh, NO! Seems they all come in as nulls???
				interfaceNode.collectionIds = interfaceNode.collectionIds
					? forceArray(interfaceNode.collectionIds)
						.map((collectionIdReference) => `${collectionIdReference}`) // Convert reference to string, so comparisons work
						.filter((v,i,a)=>a.indexOf(v)==i) // Remove duplicates (NOTE Doesn't work on references)
					: [];
				//log.debug(`(before) interfaceNode.collectionIds:${toStr(interfaceNode.collectionIds)}`); // Should be strings
				interfaceNode.collections && forceArray(interfaceNode.collections).forEach((collectionName) => {
					const collectionId = collectionNameToIdObj[collectionName];
					if (collectionId) {
						if (!interfaceNode.collectionIds.includes(collectionId)) { // NOTE Comparison doesn't work on references
							interfaceNode.collectionIds.push(collectionId);
						} else {
							log.warning(`collectionId:${collectionId} already present in collectionIds`);
						}
					} else {
						log.error(`Unable to find collectionId from collectionName:${collectionName}. Dropped from interface!`);
					}
				}); // forEach collectionName
				//log.debug(`(after) interfaceNode.collectionIds:${toStr(interfaceNode.collectionIds)}`); // Should be strings
				interfaceNode.collectionIds = interfaceNode.collectionIds.map((collectionId) => reference(collectionId));
				//log.debug(`(out) collectionIdReferences:${toStr(interfaceNode.collectionIds)}`); // This should report nulls again
				delete interfaceNode.collections;
				return interfaceNode;
			} // editor
		}); // modify
		progress.finishItem(); // setInfo(`Done converting collections -> collectionIds in interfaceId:${interfaceId}`)
	}); // forEach interfaceId

	setModel({
		connection: writeConnection,
		version: 11
	});
}
