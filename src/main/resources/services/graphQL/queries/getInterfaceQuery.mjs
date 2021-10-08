export const getInterfaceQuery = ({
	_id
}) => `getInterface(
	_id: "${_id}"
) {
	_id
	_name
	_nodeType
	_path
	_versionKey
	collectionIds
	fields {
		boost
		#fieldId
		name
	}
	#stopWordIds
	stopWords
	#synonymIds
	synonyms
}`;
