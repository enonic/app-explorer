export const GQL_MUTATION_UPDATE_COLLECTION = `mutation UpdateCollectionMutation(
	$_id: ID!
	$collector: CollectionCollectorInput
	$cron: [CollectionCronInput]
	$doCollect: Boolean
	$documentTypeId: ID
	$language: String
) {
	updateCollection(
		_id: $_id
		collector: $collector
		cron: $cron
		doCollect: $doCollect
		documentTypeId: $documentTypeId
		language: $language
	) {
		_id
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
