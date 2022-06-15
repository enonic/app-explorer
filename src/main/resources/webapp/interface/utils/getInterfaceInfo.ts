import type {CollectionNode} from '/lib/explorer/types/Collection.d';
import type {DocumentTypeNode} from '/lib/explorer/types/DocumentType.d';
import type {Field} from '/lib/explorer/types/index.d';


import {
	HIGHLIGHT_FIELD_ALLTEXT,
	camelize,
	forceArray,
	isSet//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getCollectionIds} from '/lib/explorer/collection/getCollectionIds';
import {get as getInterface} from '/lib/explorer/interface/get';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';


export function getInterfaceInfo({
	fieldsRes,
	interfaceName
} :{
	fieldsRes :{
		count :number
		hits: Array<Field>
		total :number
	}
	interfaceName :string
}) {
	//log.debug('getInterfaceInfo fieldsRes:%s', toStr(fieldsRes));
	//log.debug(`getInterfaceInfo({interfaceName:%s})`, interfaceName);

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	//log.debug('getInterfaceInfo() interfaceNode:%s', toStr(interfaceNode));

	const filteredInterfaceNode = coerseInterfaceType(interfaceNode);
	//log.debug('getInterfaceInfo() filteredInterfaceNode:%s', toStr(filteredInterfaceNode));

	const {
		fields = [],// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords//,
		//synonyms // TODO
	} = filteredInterfaceNode;
	//log.debug('getInterfaceInfo collectionIds:%s', toStr(collectionIds));
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	//log.debug(`synonyms:${toStr(synonyms)}`);

	let {
		collectionIds,
	} = filteredInterfaceNode;
	if (interfaceName === 'default' ) {
		// The default interface has no collectionIds, so get all collectionIds:
		collectionIds = getCollectionIds({
			connection: explorerRepoReadConnection
		});
	}
	//log.debug('getInterfaceInfo() collectionIds:%s', toStr(collectionIds));

	const collections = forceArray(explorerRepoReadConnection.get<CollectionNode>(...collectionIds) as CollectionNode);
	//log.debug('getInterfaceInfo collections:%s', toStr(collections));

	const collectionIdToDocumentTypeId :{
		[k :string] :string
	} = {};
	const documentTypeIds = collections.map(({
		_id: collectionId,
		documentTypeId
	}) => {
		if (isSet(documentTypeId)) {
			collectionIdToDocumentTypeId[collectionId] = documentTypeId;
		}
		return documentTypeId;
	})
		.filter((v, i, a) => isSet(v) && a.indexOf(v) === i);
	//log.debug(`documentTypeIds:${toStr(documentTypeIds)}`);

	const documentTypes = forceArray(explorerRepoReadConnection.get<DocumentTypeNode>(...documentTypeIds) as DocumentTypeNode);
	//log.debug(`documentTypes:${toStr(documentTypes)}`);

	const allFieldKeys :Array<string> = [];

	const documentTypeIdToName :{
		[k :string] :string
	} = {};
	documentTypes.forEach(({
		_id: documentTypeId,
		_name: documentTypeName,
		properties
	}) => {
		documentTypeIdToName[documentTypeId] = documentTypeName;
		if (properties) {
			forceArray(properties).forEach(({name}) => {
				if (!allFieldKeys.includes(name)) {
					allFieldKeys.push(name);
				}
			});
		}
	});
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);

	fieldsRes.hits.forEach(({key}) => {
		if (!allFieldKeys.includes(key)) {
			allFieldKeys.push(key);
		}
	});
	allFieldKeys.sort();
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);

	//log.debug('QUERY_FIELD_ALLTEXT:%s', QUERY_FIELD_ALLTEXT);
	const interfaceSearchHitsHighlightsFields :{
		[k :string] :any
	} = {
		[HIGHLIGHT_FIELD_ALLTEXT]: { type: list(GraphQLString) }
	};
	allFieldKeys.forEach((fieldKey) => {
		const camelizedFieldKey = camelize(fieldKey, /[.-]/g);
		interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(GraphQLString) };
	});
	//log.debug(`interfaceSearchHitsHighlightsFields:${toStr(interfaceSearchHitsHighlightsFields)}`);

	return {
		allFieldKeys,
		collections,
		collectionIdToDocumentTypeId,
		documentTypeIdToName,
		documentTypes,
		fields,
		interfaceSearchHitsHighlightsFields,
		stopWords
	};
}
