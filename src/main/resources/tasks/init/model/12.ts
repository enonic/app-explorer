import type {
	OneOrMore,
	RepoConnection
} from '/lib/explorer/types/index.d';


import {
	addQueryFilter,
	forceArray
} from '@enonic/js-utils';
import {
	NT_INTERFACE,
	NT_THESAURUS
} from '/lib/explorer/index';
import {setModel} from '/lib/explorer/model/setModel';
import {hasValue} from '/lib/explorer/query/hasValue';
//@ts-ignore
import {reference} from '/lib/xp/value';
import {Progress} from '../Progress';


type InterfaceNodeWithSynonyms = /*InterfaceNode &*/ {
	synonymIds? :Array<string>
	synonyms? :OneOrMore<string>
}



export function model12({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	progress.addItems(1).setInfo('Finding interfaces with synonyms...').report().logInfo();

	const allThesauri = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_THESAURUS]),
			filters: {}
		}),
		query: ''
	}).hits
		.map(({id}) => writeConnection.get(id))
		.map(({_id, _name}) => ({_id, _name}));
	//log.debug(`allThesauri:${toStr(allThesauri)}`);

	const thesauriNameToIdObj = {};
	allThesauri.forEach(({_id, _name}) => {
		thesauriNameToIdObj[_name] = _id;
	});
	//log.debug(`thesauriNameToIdObj:${toStr(thesauriNameToIdObj)}`);

	const interfacesWithSynonymsQueryParams = {
		count: -1,
		filters: addQueryFilter({
			filter: {
				exists: { field: 'synonyms'}
			},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	};
	//log.debug(`interfacesWithSynonymsQueryParams:${toStr(interfacesWithSynonymsQueryParams)}`);

	const interfaceIds = writeConnection.query(interfacesWithSynonymsQueryParams).hits.map(({id}) => id);
	//log.debug(`interfaceIds:${toStr(interfaceIds)}`);

	progress.addItems(interfaceIds.length); // .setInfo(`Found ${interfaceIds.length} interfaces with synonyms.`)
	progress.finishItem(); // .setInfo('Done finding interfaces with synonyms.')

	interfaceIds.forEach((interfaceId) => {
		progress.setInfo(`Converting synonyms -> synonymIds in interfaceId:${interfaceId}`).report().logInfo();
		writeConnection.modify<InterfaceNodeWithSynonyms>({
			key: interfaceId,
			editor: (interfaceNode) => {
				//log.debug(`(in) synonymIdReferences:${toStr(interfaceNode.synonymIds)}`); // Oh, NO! Seems they all come in as nulls???
				interfaceNode.synonymIds = interfaceNode.synonymIds
					? forceArray(interfaceNode.synonymIds)
						.map((synonymIdReference) => `${synonymIdReference}`) // Convert reference to string, so comparisons work
						.filter((v,i,a)=>a.indexOf(v)==i) // Remove duplicates (NOTE Doesn't work on references)
					: [];
				//log.debug(`(before) interfaceNode.synonymIds:${toStr(interfaceNode.synonymIds)}`); // Should be strings
				interfaceNode.synonyms && forceArray(interfaceNode.synonyms).forEach((synonymName) => {
					const synonymId = thesauriNameToIdObj[synonymName];
					if (synonymId) {
						if (!interfaceNode.synonymIds.includes(synonymId)) { // NOTE Comparison doesn't work on references
							interfaceNode.synonymIds.push(synonymId);
						} else {
							log.warning(`synonymId:${synonymId} already present in synonymIds`);
						}
					} else {
						log.error(`Unable to find synonymId from synonymName:${synonymName}. Dropped from interface!`);
					}
				}); // forEach synonymName
				//log.debug(`(after) interfaceNode.synonymIds:${toStr(interfaceNode.synonymIds)}`); // Should be strings
				interfaceNode.synonymIds = interfaceNode.synonymIds.map((synonymId) => reference(synonymId));
				//log.debug(`(out) synonymIdReferences:${toStr(interfaceNode.synonymIds)}`); // This should report nulls again
				delete interfaceNode.synonyms;
				return interfaceNode;
			} // editor
		}); // modify
		progress.finishItem(); // setInfo(`Done converting synonyms -> synonymIds in interfaceId:${interfaceId}`)
	}); // forEach interfaceId

	setModel({
		connection: writeConnection,
		version: 12
	});
}
