export function coerseCollectionType({
	_id,
	_name,
	_nodeType,
	_path,
	_score,
	collector,
	createdTime,
	creator,
	documentCount,
	documentTypeId,
	interfaces,
	language,
	modifiedTime,
	modifier
}) {
	return {
		_id,
		_name,
		_nodeType,
		_path,
		_score,
		collector,
		createdTime,
		creator,
		documentCount,
		documentTypeId,
		interfaces,
		language,
		modifiedTime,
		modifier
	};
}
