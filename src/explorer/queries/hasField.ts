export const GQL_QUERY_HAS_FIELD = `query hasField(
	$collections: [String!]!
	$count: Int
	$field: String!
	$filters: Filters
) {
	hasField(
		collections: $collections
		count: $count
		field: $field
		filters: $filters
	) {
		count
		hits {
			_branchId
			_id
			_name
			_nodeType
			_path
			_versionKey
		}
		total
	}
}`;

/*
{
	"collections": [""],
	"count": 2,
	"field": "_name",
	"filters": {
		"boolean": {
			"must": {
				"hasValue": {
					"field": "_nodeType",
					"values": [
						"default"
					]
				}
			}
		}
	}
}
*/
