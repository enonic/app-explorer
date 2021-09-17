export const GQL_MUTATION_CREATE_DOCUMENT_TYPE = `mutation CreateDocumentTypeMutation(
	$_name: String!,
	$fields: [InputDocumentTypeFields]
	$properties: [InputDocumentTypeProperties]
) {
	createDocumentType(
		_name: $_name
		fields: $fields
		properties: $properties
	) {
		_id
		_name
		_path
		_versionKey
		fields {
			active
			fieldId
		}
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
		"ngram": false,
		"valueType": "long"
	}]
}
*/
