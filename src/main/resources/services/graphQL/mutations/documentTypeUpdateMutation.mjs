export const GQL_MUTATION_DOCUMENT_TYPE_UPDATE = `mutation UpdateDocumentTypeMutation(
	$_id: ID!,
	$_name: String!,
	$_versionKey: ID!
	$addFields: Boolean
	$properties: [DocumentTypePropertiesInput]
) {
	updateDocumentType(
		_id: $_id
		_name: $_name
		_versionKey: $_versionKey
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
	"_id": "88a0fa01-46e0-4536-a499-c8cf227fdcd0",
	"_name": "a",
	"_versionKey": "200f7cc6-4787-41f4-bf94-0662f0380c80",
	"properties": [{
		"enabled": false,
		"fulltext": true,
		"includeInAllText": true,
		"max": 2,
		"min": 3,
		"name": "myObject.subProperty",
		"nGram": true,
		"valueType": "double"
	}]
}
*/
