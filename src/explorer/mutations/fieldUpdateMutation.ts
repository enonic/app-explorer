export const GQL_MUTATION_FIELD_UPDATE = `mutation UpdateField(
	# Required parameters
	$_id: ID!
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
	updateField(
		# Required parameters
		_id: $_id
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
	  key
	  max
	  min
	  nGram
	  path
  }
}`;


/* Example variables for testing
{
	"_id": FIND VALID FIELD ID,
	"description": "description changed",
	"fieldType": "long",
	"max": 2,
	"min": 2,

	"decideByType": true,
	"enabled": true,
	"fulltext": true,
	"includeInAllText": true,
	"nGram": true,
	"path": false
}
*/
