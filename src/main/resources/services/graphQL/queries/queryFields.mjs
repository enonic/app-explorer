export const queryFields = ({
	fields = [],
	includeSystemFields = false
} = {}) => `queryFields(
	fields: ${fields}
	includeSystemFields: ${includeSystemFields}
) {
	count
	total
	hits {
		_id
		_name
		_nodeType
		_path

		key

		denyDelete
		description
		fieldType
		max
		min

		indexConfig {
			decideByType
			enabled
			fulltext
			includeInAllText
			nGram
			path
		}
		decideByType
		enabled
		fulltext
		includeInAllText
		nGram
		path

		_referencedBy(
			filters: {
				boolean: {
					must: {
						hasValue: {
							field: "_nodeType"
							values: ["com.enonic.app.explorer:documentType"]
						}
					}
				}
			}
		) {
			count
			hits { # Only documentType nodes
				#__typename
				... on DocumentType {
					_id
					_name
					_nodeType
					_path
					#_score # WHY NOT IMPLEMENTED???
					_referencedBy(
						filters: {
							boolean: {
								must: {
									hasValue: {
										field: "_nodeType"
										values: ["com.enonic.app.explorer:collection"]
									}
								}
							}
						}
					) {
						count
						hits { # Only collection nodes
							#__typename
							... on Collection {
								_id
								_name
								_nodeType
								_path
								#_score # WHY NOT IMPLEMENTED???
								_hasField(
								   count: 0
								   filters: {
									   boolean: {
										   must: {
											   hasValue: {
												   field: "_nodeType"
												   values: ["com.enonic.app.explorer:document"]
											   }
										   }
									   }
								   }
							   ) {
								   #count
								   #hits { # Only document nodes
								   #	_branchId
								   #	_id
								   #	_name
								   #	_nodeType
								   #	_path
								   #	_versionKey
								   #}
								   total
							   } # _hasField
							}
						}
						total
					}
				} # on DocumentType
			}
			total
		}
	}
}`;
