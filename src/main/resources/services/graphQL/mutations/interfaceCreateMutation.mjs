export const GQL_MUTATION_INTERFACE_CREATE = `mutation InterfaceCreateMutation(
	$_name: String!
	$collectionIds: [ID]
	$fields: [InterfaceFieldInput]
	#$stopWordIds: [ID]
	$stopWords: [String]
	$synonymIds: [ID]
) {
	createInterface(
		_name: $_name
		collectionIds: $collectionIds
		fields: $fields
		#stopWordIds: $stopWordIds
		stopWords: $stopWords
		synonymIds: $synonymIds
	) {
		_id
		_name
    	_nodeType
		_path
		_versionKey
		collectionIds
		fields {
			boost
			#fieldId
			name
		}
		#stopWordIds
		stopWords
		synonymIds
	} # createInterface
}`;


/* Example query variables:
{
	"_name": "a",
	"collectionIds": "556e04a5-dbb5-4db4-92c1-afb2fc031e2b",
	"fields": {
		"fieldId": "b220174f-d0f7-43a0-89ef-8324a7bdc59b",
		"boost": 3
	},
	"stopWordIds": "ecbaf718-acf7-4ef7-869e-86afa1ab33d7",
	"synonymIds": "3b46ba9f-e8bd-4639-b1ac-d33911b9c1cf"
}
*/
