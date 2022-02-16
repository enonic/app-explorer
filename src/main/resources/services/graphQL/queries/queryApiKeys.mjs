export const queryApiKeys = ({
	count = -1,
	sort = '_name ASC', //'_score DESC'
	start = 0
}) => `queryCollections(
	count: ${count}
	sort: ${sort}
	start: ${start}
) {
  queryApiKeys {
	count
    hits {
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
	total
  }
}`;
