export const GQL_MUTATION_FIELD_UPDATE = `mutation UpdateField(
	$_id: String!

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
	updateField(
		_id: $_id

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
	"_id": FIND VALID FIELD ID,
	"description": "description",
	"fieldType": "long",
	"max": 2,
	"min": 2,

	"instruction": "custom",

	"decideByType": true,
	"enabled": true,
	"fulltext": true,
	"includeInAllText": true,
	"nGram": true,
	"path": false
}

{
	"_id": FIND VALID FIELD ID,
	"description": "description",
	"fieldType": "long",
	"max": 2,
	"min": 2,

	"instruction": "minimal",
}
*/
