export type QueryThesauriGraph = {
	count :number
	hits :Array<{
		_id :string
		_name :string
		_nodeType :string
		_path :string
		//_versionKey :string
		description :string
		language :{
			from :string
			to :string
		}
		synonymsCount :number
	}>
	total :number
}
