export const GQL_MUTATION_API_KEY_CREATE = `mutation ApiKeyCreateMutation(
	$_name: String!
	$collections: [String]
	$interfaces: [String]
	$key: String!
) {
	createApiKey(
		_name: $_name
		collections: $collections
		interfaces: $interfaces
		key: $key
	) {
		_id
		_name
		collections
		createdTime
		creator
		hashed
		interfaces
		key
	}
}`;


/* Example query variables:
{
	"_name": "a",
	"key": "a"
}
*/
