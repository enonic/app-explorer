export const GQL_MUTATION_CREATE_DOCUMENT_TYPE = `mutation CreateDocumentTypeMutation(
	$_name: String!,
	$properties: [InputDocumentTypeProperties]
) {
	createDocumentType(
		_name: $_name
		properties: $properties
	) {
		_id
		_name
		_path
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
