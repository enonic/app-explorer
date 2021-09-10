export const GQL_QUERY_GET_DOCUMENT_TYPE = `query GetDocumentTypeQuery($_id: String!) {
	getDocumentType(_id: $_id) {
		_id
		_name
		_path
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
}`;
