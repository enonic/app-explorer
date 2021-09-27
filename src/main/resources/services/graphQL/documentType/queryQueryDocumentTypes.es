export const GQL_QUERY_QUERY_DOCUMENT_TYPES = `query QueryDocumentTypesQuery {
	queryDocumentTypes {
		hits {
			_id
			_name
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
			referencedBy {
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
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes
