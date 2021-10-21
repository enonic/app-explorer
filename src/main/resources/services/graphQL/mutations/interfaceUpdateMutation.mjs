export const GQL_MUTATION_INTERFACE_UPDATE = `mutation InterfaceUpdateMutation(
	$_id: ID!
	$_name: String!
	$collectionIds: [ID]
	$fields: [InterfaceFieldInput]
	#$stopWordIds: [ID]
	$stopWords: [String]
	$synonymIds: [ID]
) {
	updateInterface(
		_id: $_id
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
			name
		}
		#stopWordIds
		stopWords
		synonymIds
	} # updateInterface
}`;


/* Example query variables:
{
	"_id": "",
	"_name": "a",
	"collectionIds": "556e04a5-dbb5-4db4-92c1-afb2fc031e2b",
	"fields": {
		"boost": 3,
		"name": "extra"
	},
	"stopWordIds": "ecbaf718-acf7-4ef7-869e-86afa1ab33d7",
	"synonymIds": "3b46ba9f-e8bd-4639-b1ac-d33911b9c1cf"
}
*/
