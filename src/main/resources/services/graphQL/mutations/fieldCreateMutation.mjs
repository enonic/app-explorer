export const GQL_MUTATION_FIELD_CREATE = `mutation CreateField(
	# Required parameters
	$key: String!
	# Optional parameters
	$decideByType: Boolean
	$description: String
	$enabled: Boolean
	$fieldType: String
	$fulltext: Boolean
	$includeInAllText: Boolean
	$max: Int
	$min: Int
	$nGram: Boolean
	$path: Boolean
) {
	createField(
		# Required parameters
		key: $key
		# Optional parameters
		decideByType: $decideByType
		description: $description
		enabled: $enabled
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
	  _versionKey
	  decideByType
	  denyDelete
	  description
	  enabled
	  fieldType
	  fulltext
	  includeInAllText
	  indexConfig {
		  decideByType
		  enabled
		  fulltext
		  includeInAllText
		  nGram
		  path
	  }
	  inResults
	  key
	  max
	  min
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
