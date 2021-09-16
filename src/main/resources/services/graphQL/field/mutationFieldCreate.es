export const GQL_MUTATION_FIELD_CREATE = `mutation CreateField(
	$key: String!

	$decideByType: Boolean
	$enabled: Boolean
	$description: String
	$fieldType: String
	$fulltext: Boolean
	$includeInAllText: Boolean
	$instruction: String
	$max: Int
	$min: Int
	$nGram: Boolean
	$path: Boolean
) {
	createField(
		key: $key

		decideByType: $decideByType
		enabled: $enabled
		description: $description
		fieldType: $fieldType
		fulltext: $fulltext
		includeInAllText: $includeInAllText
		instruction: $instruction
		max: $max
		min: $min
		nGram: $nGram
		path: $path
  ) {
	  _id
	  _name
	  _nodeType
	  _path

	  key

	  denyDelete
	  fieldType
	  inResults
	  instruction
	  indexConfig {
		  decideByType
		  enabled
		  fulltext
		  includeInAllText
		  nGram
		  path
	  }
	  decideByType
	  enabled
	  fulltext
	  includeInAllText
	  nGram
	  path
  }
}`;


/* Example variables for testing
{
	"key": "a",
	"decideByType": false,
	"enabled": false,
	"description": "description",
	"fieldType": "long",
	"fulltext": false,
	"includeInAllText": false,
	"instruction": "custom",
	"max": 1,
	"min": 1,
	"nGram": false,
	"path": true
}
*/
