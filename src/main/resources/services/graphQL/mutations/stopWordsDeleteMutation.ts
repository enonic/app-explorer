export const GQL_MUTATION_STOP_WORDS_DELETE = `mutation DeleteStopWordsMutation($_id: ID!) {
  deleteStopWords(_id: $_id) {
    _id
  }
}`;

/* Example query variables:
{
	"_id": "5360a85d-5a18-4bd9-8627-bd42972a4cdb"
}
*/
