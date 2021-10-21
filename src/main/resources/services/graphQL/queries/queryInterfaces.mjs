export const queryInterfaces = ({
	count = -1
} = {}) => `queryInterfaces(
	count: ${count}
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
}`;
