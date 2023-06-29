import type {
	ParentPath,
	RequiredNodeProperties
} from '@enonic-types/lib-explorer';


export type ApiKey = {
	_id?: string
	_name: string
	//_nodeType: string // Useless info, always the same
	//_path: string // No reason to expose
	collections: string[]
	createdTime: Date | string
	creator: string
	hashed: boolean
	interfaces: string[]
	key: string
	modifiedTime?: Date | string
	modifier?: string
}


export type ApiKeyNode = RequiredNodeProperties
	& Omit<ApiKey, '_id'|'_name'|'collections'|'interfaces'>
	& {
		collections?: string | string[]
		interfaces?: string | string[]
	}

export type ApiKeyNodeCreateParams =
	Omit<
		RequiredNodeProperties,
		'_id'
		|'_childOrder'
		|'_path'
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
		_parentPath?: ParentPath
		collections?: string | string[]
		interfaces?: string | string[]
	}

export type ApiKeyNodeUpdated = Omit<ApiKeyNode,|'modifiedTime'|'modifier'> & {
	modifiedTime: Date | string
	modifier: string
}
