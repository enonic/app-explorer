export const GQL_QUERY_DOCUMENT_TYPES_QUERY = `query QueryDocumentTypesQuery {
	queryDocumentTypes {
		hits {
			_id
			_name
			_nodeType
			_path
			_versionKey
			addFields
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
				hits {
					#__typename
					... on Collection {
	 					_id
	 					_name
	 					_nodeType
	 					_path
	 					#_score
						_hasField(
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
					   } # _hasField
					   _referencedBy(
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
					   } # _referencedBy
					 } # on Collection
				}
				total
			} # _referencedBy
		}
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes
