export const GQL_MUTATION_STOP_WORDS_UPDATE = `mutation StopWordsUpdateMutation(
	$_id: ID!
	$words: [String]
) {
	updateStopWords(
		_id: $_id
		words: $words
	) {
		_id
		_name
		_nodeType
		_path
		_versionKey
		words
	}
}`;


/* Example query variables:
{
	"_id": "4e92e59b-5fca-42c7-9ba9-38a140cddb28",
	"words": ["a"]
}
*/
