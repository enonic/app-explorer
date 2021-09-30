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
			description
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

			_referencedBy {
				count
				hits {
					_id
					_name
					_nodeType
					_path
					_score
					_referencedBy {
						count
						hits {
							_id
							_name
							_nodeType
							_path
							_score
						}
						total
					}
				}
				total
			}
		}
	}
}`;
