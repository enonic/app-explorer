export const GQL_QUERY_QUERY_DOCUMENT_TYPES = `query QueryDocumentTypesQuery {
	queryDocumentTypes {
		hits {
			_id
			_name
			_versionKey
			properties {
				enabled
				fulltext
				includeInAllText
				max
				min
				name
				ngram
				valueType
			}
		}
	}
}`;