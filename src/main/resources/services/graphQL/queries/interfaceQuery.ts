export const GQL_QUERY_INTERFACE = `query InterfaceQuery(
	$count: Int
) {
	queryInterfaces(
		count: $count
	) {
		count
		hits {
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
			stopWordIds
			synonymIds
		}
		total
	}
}`;

/* Example query variables:
{
	"count": -1
}
*/
