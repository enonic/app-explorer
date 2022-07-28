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
