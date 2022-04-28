export function queryStopWords({
	count = -1
} :{
	count? :string|number
} = {}) {
	return `queryStopWords(
	count: ${count}
) {
	total
	count
	hits {
		_id
		_name
		_nodeType
		_path
		_versionKey
		words
	}
}`;
}


export const GQL_QUERY_STOP_WORDS = `query StopWordsQuery(
	$count: Int
) {
	${queryStopWords({count: '$count'})}
}`;
