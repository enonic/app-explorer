import type {QueriedSynonym} from '/lib/explorer/types/index.d';


export type EditSynonymsModalState = {
	_id ?:string
	_name ?:string
	open :boolean
}

export type EditSynonymsState = {
	aggregations: {
		thesaurus: {
			buckets: Array<{
				docCount :number
				key :string
			}>
		}
	},
	count :number
	end :number
	hits :Array<QueriedSynonym>
	page :number
	start :number
	total :number
	totalPages :number
}

export type NewOrEditState = {
	_id ?:string
	open :boolean
}

export type QueryThesauriGraph = {
	count :number
	hits :Array<{
		_id :string
		_name :string
		_nodeType :string
		_path :string
		//_score :number
		//_versionKey :string
		description :string
		allowedLanguages :Array<string>
		synonymsCount :number
	}>
	total :number
}
