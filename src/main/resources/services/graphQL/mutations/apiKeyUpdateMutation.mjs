export const GQL_MUTATION_API_KEY_UPDATE = `mutation ApiKeyUpdateMutation(
	$_id: ID!
	$collections: [String]
	$interfaces: [String]
	$key: String
) {
	updateApiKey(
		_id: $_id
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
		modifiedTime
		modifier
	}
}`;


/* Example query variables:
{
	"_id": "5360a85d-5a18-4bd9-8627-bd42972a4cdb",
	"key": "b"
}
*/
