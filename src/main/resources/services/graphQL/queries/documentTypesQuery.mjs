export const GQL_QUERY_QUERY_DOCUMENT_TYPES = `query QueryDocumentTypesQuery {
	queryDocumentTypes {
		hits {
			_id
			_name
			_nodeType
			_path
			_versionKey
			addFields
			fields {
				active
				fieldId
			}
			properties {
				active
				enabled
				fulltext
				includeInAllText
				max
				min
				name
				nGram
				path
				valueType
			}
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
				hits {
					#__typename
					... on Collection {
	 					_id
	 					_name
	 					_nodeType
	 					_path
	 					#_score
						__hasField(
						   count: 0
						   field: "_name"
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
					   __referencedBy(
						   filters: {
							   boolean: {
								   must: {
									   hasValue: {
										   field: "_nodeType"
										   values: ["com.enonic.app.explorer:interface"]
									   }
								   }
							   }
						   }
					   ) {
						   count
						   hits { # Only interface nodes
							   #__typename
							   ... on Interface {
								   _id
								   _name
								   _nodeType
								   _path
								   #_score
							   }
						   }
						   total
					   } # __referencedBy
					 } # on Collection
				}
				total
			} # __referencedBy
		}
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes
