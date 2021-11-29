export const GQL_QUERY_FIELDS_QUERY = `query QueryFieldsQuery(
	$fields: [String]
	$includeSystemFields: Boolean
) {
	queryFields(
		fields: $fields
		includeSystemFields: $includeSystemFields
	) {
		total
		count
		hits {
			_id
			_name
			_nodeType
			_path
			decideByType
			denyDelete
			description
			enabled
			fieldType
			fulltext
			includeInAllText
			indexConfig {
				decideByType
				enabled
				fulltext
				includeInAllText
				nGram
				path
			}
			inResults
			key
			max
			min
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
	}
}`;
