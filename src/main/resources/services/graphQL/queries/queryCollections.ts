export const queryCollections = ({
	page = 1, // index starts at 1 not 0
	perPage = -1, // Sorta like count,
	query = '',
	sort = ''//'_score DESC'
}) => `queryCollections(
	page: ${page}
	perPage: ${perPage}
	query: ${query}
	sort: ${sort}
) {
	total
	count
	page
	pageStart
	pageEnd
	pagesTotal
	hits {
		_id
		_name
		_nodeType
		_path
		_score
		collector {
			name
			configJson
		}
		createdTime
		creator
		documentCount
		documentTypeId
		interfaces
		language
		modifiedTime
		modifier
	}
}`;
//hits.collector.managedDocumentTypes
