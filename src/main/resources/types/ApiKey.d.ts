import type {
	ParentPath,
	RequiredNodeProperties
} from '/lib/explorer/types.d';


export interface ApiKey {
	_id? :string
	_name :string
	//_nodeType :string // Useless info, always the same
	//_path :string // No reason to expose
	collections :Array<string>
	createdTime :Date | string
	creator :string
	hashed :boolean
	interfaces :Array<string>
	key :string
	modifiedTime? :Date | string
	modifier? :string
}


export type ApiKeyNode = RequiredNodeProperties
	& Omit<ApiKey, '_id'|'_name'|'collections'|'interfaces'>
	& {
		collections? :string | Array<string>
		interfaces? :string | Array<string>
	}

export type ApiKeyNodeCreateParams =
	Omit<
		RequiredNodeProperties,
		'_id'
		|'_childOrder'
		|'_path'
		|'_permissions'
		|'_state'
		|'_ts'
		|'_versionKey'
		>
	& Omit<
		ApiKey, '_id'|'collections'|'interfaces'
		//|'createdTime'|'creator'
		|'modifiedTime'|'modifier'
	>
	& {
		_parentPath? :ParentPath
		collections? :string | Array<string>
		interfaces? :string | Array<string>
	}

export type ApiKeyNodeUpdated = Omit<ApiKeyNode,|'modifiedTime'|'modifier'> & {
	modifiedTime :Date | string
	modifier :string
}
