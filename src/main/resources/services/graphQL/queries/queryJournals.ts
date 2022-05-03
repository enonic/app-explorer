export const queryJournals = ({
	count = -1
} = {}) => `queryJournals(
	count: ${count}
) {
	count
	hits {
		_id
		#_name
		#_path
		#_versionKey
		displayName
		endTime
		errorCount
		duration
		name
		startTime
		successCount
		#errors {
		#	message
		#	uri
		#}
		#successes {
		#	message
		#	uri
		#}
	}
	total
}`;
