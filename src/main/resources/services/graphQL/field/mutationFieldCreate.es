export const GQL_MUTATION_FIELD_CREATE = `mutation CreateField(
	$key: String!

	$decideByType: Boolean
	$enabled: Boolean
	$description: String
	$fieldType: String
	$fulltext: Boolean
	$includeInAllText: Boolean
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
	  description
	  fieldType
	  inResults
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
	"description": "description",
	"enabled": false,
	"fieldType": "long",
	"fulltext": false,
	"includeInAllText": false,
	"max": 1,
	"min": 1,
	"nGram": false,
	"path": true
}
*/
