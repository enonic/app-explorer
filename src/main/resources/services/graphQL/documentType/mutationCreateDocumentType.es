export const GQL_MUTATION_CREATE_DOCUMENT_TYPE = `mutation CreateDocumentTypeMutation(
	$_name: String!
	$addFields: Boolean
	$fields: [DocumentTypeFieldsInput]
	$properties: [DocumentTypePropertiesInput]
) {
	createDocumentType(
		_name: $_name
		addFields: $addFields
		fields: $fields
		properties: $properties
	) {
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
	"fields": [{
		"active": true,
		"fieldId": "de39eb2a-f7ac-4dfb-b91a-ecd4f3e3f128"
	}],
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
