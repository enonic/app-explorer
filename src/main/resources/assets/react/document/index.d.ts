export interface QueryDocumentsHit {
	_id: string
	_json: string
	_highlight?: Record<string,string[]>
	document_metadata: {
		collection: string
		collector: {
			id: string
			version: string
		}
		documentType: string
		language: string
		stemmingLanguage: string
		valid: boolean
	}
	parsedJson: Record<string,unknown>
}

export interface QueryDocumentsResult {
	// aggregations: // TODO
	hits: QueryDocumentsHit[]
	total: number
}
