export const GQL_QUERY_FIELD_GET = `query FieldGetQuery(
	$_id: ID!
) {
	getField(
		_id: $_id
	) {
		_id
		_name
		_nodeType
		_path
		_versionKey
		denyDelete
		description
		decideByType
		enabled
		fieldType
		fulltext
		includeInAllText
		indexConfig {
			decideByType
			enabled
			fulltext
			includeInAllText
			nGram
			path
		} #indexConfig
		inResults
		key
		max
		min
		nGram
		path
	} # getField
}`;
