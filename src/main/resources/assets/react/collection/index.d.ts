import type {
	SemanticShorthandContent,
	StrictDropdownItemProps
} from 'semantic-ui-react';


export type Cron = {
	minute :string
	hour :string
	dayOfMonth :string
	month :string
	dayOfWeek :string
}

export type DropdownItemPropsWithKey<Value extends boolean | number | string> = Omit<StrictDropdownItemProps,'text'|'value'> & {
	key: Value
	text: SemanticShorthandContent
    value: Value
}

export type DropdownItemsWithKeys<Value extends boolean | number | string> = Array<DropdownItemPropsWithKey<Value>>

export type QueryCollectionsHit = {
	_id: string
	_name: string
	_path: string
	collector?: {
		name: string
		configJson: string
		managedDocumentTypes?: string[]
	}
	documentCount: number
	// interfaces: {}
	language: string
	documentTypeId: string
}

export type QueryCollectionsHits = Array<QueryCollectionsHit>

export type QueryCollectionsGraph = {
	aggregationsAsJson?: Record<string, unknown>
	total: number
	count: number
	page?: number
	pageStart?: number
	pageEnd?: number
	pagesTotal?: number
	hits: QueryCollectionsHits
}
