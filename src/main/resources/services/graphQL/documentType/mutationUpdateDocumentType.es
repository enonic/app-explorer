export const GQL_MUTATION_UPDATE_DOCUMENT_TYPE = `mutation UpdateDocumentTypeMutation(
	$_id: String!,
	$_name: String!,
	$_versionKey: String!
	$properties: [InputDocumentTypeProperties]
) {
	updateDocumentType(
		_id: $_id
		_name: $_name
		_versionKey: $_versionKey
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
