export const GQL_QUERY_QUERY_COLLECTIONS = `query QueryCollectionsQuery(
  $page: Int
  $perPage: Int
  $query: String
  $sort: String
) {
  queryCollections(
    page: $page # 1
    perPage: $perPage # -1
    query: $query #"fulltext('_allText', 'a')"
    sort: $sort # "_score DESC"
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
  }
}`;
