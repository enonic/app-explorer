export const GQL_QUERY_QUERY_FIELDS = `query QueryFieldsQuery(
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

			key

			denyDelete
			description
			fieldType
			inResults
			max
			min

			instruction
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

			__referencedBy(
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
						__referencedBy(
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
									__hasField(
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
								   } # __hasField
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
