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

			key

			denyDelete
			fieldType
			inResults
			max
			min

			instruction
			indexConfig {
				decideByType
				enabled
				fulltext
				includeInAllText
				nGram
				path
			}
			decideByType
			enabled
			fulltext
			includeInAllText
			nGram
			path
		}
	}
}`;
