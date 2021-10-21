export const GQL_MUTATION_DOCUMENT_TYPE_CREATE = `mutation CreateDocumentTypeMutation(
	$_name: String!
	$addFields: Boolean
	$properties: [DocumentTypePropertiesInput]
) {
	createDocumentType(
		_name: $_name
		addFields: $addFields
		properties: $properties
	) {
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
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes

/* Example variables for manual testing
{
	"_name": "a",
	"properties": [{
		"enabled": true,
		"fulltext": false,
		"includeInAllText": false,
		"max": 1,
		"min": 1,
		"name": "myObject.subProperty",
		"nGram": false,
		"valueType": "long"
	}]
}
*/
