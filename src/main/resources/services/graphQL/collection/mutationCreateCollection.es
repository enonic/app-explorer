export const GQL_MUTATION_CREATE_COLLECTION = `mutation CreateCollectionMutation(
	$_name: String!
	$collector: CollectionCollectorInput
	$cron: [CollectionCronInput]
	$doCollect: Boolean
	$documentTypeId: ID
	$language: String
) {
	createCollection(
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
