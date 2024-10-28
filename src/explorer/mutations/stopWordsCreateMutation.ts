export const GQL_MUTATION_STOP_WORDS_CREATE = `mutation StopWordsCreateMutation(
	$_name: String!
	$words: [String]
) {
	createStopWords(
		_name: $_name
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
	"_name": "a",
	"words": ["a"]
}
*/
