import type {
	IndexConfig,
	InterfaceField,
	NodeCreateParams,
	OneOrMore,
	ParentPath,
	Path,
	PermissionsParams
} from '/lib/explorer/types/index.d';


import {
	INDEX_CONFIG_N_GRAM,
	forceArray,
	isNotSet
} from '@enonic/js-utils';
import {
	INTERFACES_FOLDER,
	NT_INTERFACE,
	ROOT_PERMISSIONS_EXPLORER
} from '/lib/explorer/constants';
import {node} from '/lib/explorer/model/2/nodeTypes/node';

//@ts-ignore
import {reference} from '/lib/xp/value';


interface InterfaceModelParamsRequired {
	_name :string
}

interface InterfaceModelParamsRemoved {
	_id? :string
	_path? :Path
	_versionKey? :string
}

interface InterfaceModelParamsOverWritten {
	_indexConfig? :IndexConfig
	_inheritsPermissions? :boolean
	_parentPath? :ParentPath
	_permissions? :Array<PermissionsParams>
	_nodeType? :string
}

interface InterfaceModelParamsPassedOn {
	collectionIds? :OneOrMore<string>
	//createdTime? :Date|string
	fields? :OneOrMore<InterfaceField>
	modifiedTime? :Date|string
	stopWords? :OneOrMore<string>
	synonymIds? :OneOrMore<string>
}

type InterfaceModelParams = InterfaceModelParamsRequired
	& InterfaceModelParamsRemoved
	& InterfaceModelParamsOverWritten
	& InterfaceModelParamsPassedOn;

//type InterfaceModel = Exclude<InterfaceModelParams, InterfaceModelParamsRemoved>;
/*type InterfaceModel = InterfaceModelParamsRequired
	& InterfaceModelParamsOverWritten
	& InterfaceModelParamsPassedOn;*/
type InterfaceModel = Omit<NodeCreateParams,'_name'>
	& InterfaceModelParamsRequired
	& InterfaceModelParamsPassedOn;


export function interfaceModel({
	// Required
	_name,

	// Optional and ignored
	_id, // avoid from ...rest
	_path, // avoid from ...rest
	_versionKey, // avoid from ...rest

	// Optional and overwritten (hardcoded)
	// NOTE: _parentPath is a parameter when creating a node, used in _path
	// Since it is not stored it creates diffing issues...
	_indexConfig, // avoid from ...rest
	_inheritsPermissions, // avoid from ...rest
	_parentPath, // avoid from ...rest
	_permissions, // avoid from ...rest
	_nodeType, // avoid from ...rest

	// Optional and passed on
	collectionIds = [],
	fields = [],
	modifiedTime,
	stopWords = [],
	//stopWordIds = [],
	synonymIds = [],
	...rest // fields stopWords
} :InterfaceModelParams) :InterfaceModel {
	return node({
		...rest,
		_indexConfig: {
			default: {
				decideByType: true,
				enabled: true,
				[INDEX_CONFIG_N_GRAM]: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: []
			}
		},
		_inheritsPermissions: false, // false is the default and the fastest, since it doesn't have to read parent to apply permissions.
		_name,
		_nodeType: NT_INTERFACE,
		_parentPath :`/${INTERFACES_FOLDER}`,
		_permissions: ROOT_PERMISSIONS_EXPLORER,
		collectionIds: isNotSet(collectionIds) ? [] : forceArray(collectionIds).map((collectionId) => reference(collectionId)), // empty array allowed,
		fields: isNotSet(fields) ? [] : forceArray(fields),
		modifiedTime,
		//stopWordIds: forceArray(stopWordIds).map((stopWordId) => reference(stopWordId)), // empty array allowed,
		stopWords: isNotSet(stopWords) ? [] : forceArray(stopWords),
		synonymIds: isNotSet(synonymIds) ? [] : forceArray(synonymIds).map((synonymId) => reference(synonymId)) // empty array allowed,
	});
} // interfaceModel
