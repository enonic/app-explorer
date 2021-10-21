export const GQL_QUERY_DOCUMENT_TYPE_GET = `query GetDocumentTypeQuery($_id: ID!) {
	getDocumentType(_id: $_id) {
		_id
		_name
		_nodeType
		_path
		_versionKey
		addFields
		properties {
			active
			enabled
			fulltext
			includeInAllText
			max
			min
			name
			nGram
			path
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
