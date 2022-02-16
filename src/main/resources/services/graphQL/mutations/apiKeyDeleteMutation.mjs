export const GQL_MUTATION_API_KEY_DELETE = `mutation DeleteApiKeyMutation($_id: ID!) {
  deleteApiKey(_id: $_id) {
    _id
  }
}`;

/* Example query variables:
{
	"_id": "5360a85d-5a18-4bd9-8627-bd42972a4cdb"
}
*/
