export const GQL_QUERY_FIELDS_QUERY = `query QueryFieldsQuery(
	$fields: [String]
	$includeSystemFields: Boolean
) {
	queryFields(
		fields: $fields
		includeSystemFields: $includeSystemFields
	) {
		total
		count
		hits {
			_id
			_name
			_nodeType
			_path
			decideByType
			denyDelete
			enabled
			fieldType
			includeInAllText
			indexConfig
			inResults
			instruction
			key
			nGram
			path
		}
	}
}`;
