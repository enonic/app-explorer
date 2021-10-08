export const GQL_MUTATION_INTERFACE_DELETE = `mutation InterfaceDeleteMutation(
	$_id: ID!
) {
	deleteInterface(
		_id: $_id
	) {
		_id
	}
}`;


/* Example query variables:
{
	"_id": "",
}
*/
