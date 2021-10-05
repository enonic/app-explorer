export const GQL_QUERY_GET_DOCUMENT_TYPE = `query GetDocumentTypeQuery($_id: ID!) {
	getDocumentType(_id: $_id) {
		_id
		_name
		_path
		_versionKey
		addFields
		fields {
			active
			fieldId
		}
		properties {
			active
			enabled
			fulltext
			includeInAllText
			max
			min
			name
			ngram
			valueType
		}
		__referencedBy(
			filters: {
				boolean: {
					must: {
						hasValue: {
							field: "_nodeType"
							values: [
								"com.enonic.app.explorer:collection"
							]
						}
					}
				}
			}
		) {
			count
			hits { # Only collection nodes
				#__typename
				... on Collection {
					_id
					_name
					_nodeType
					_path
					#_score
				}
			}
			total
		} # __referencedBy
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes
