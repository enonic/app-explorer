export const GQL_MUTATION_UPDATE_COLLECTION = `mutation UpdateCollectionMutation(
	$_id: String!
	$_name: String!
	$collector: CollectionCollectorInput
	$cron: [CollectionCronInput]
	$doCollect: Boolean
	$documentTypeId: String
	$language: String
) {
	updateCollection(
		_id: $_id
		_name: $_name
    	collector: $collector
    	cron: $cron
		doCollect: $doCollect
		documentTypeId: $documentTypeId
		language: $language
	) {
		_id
		_name
    	_nodeType
		_path
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
