export const GQL_QUERY_QUERY_DOCUMENT_TYPES = `query QueryDocumentTypesQuery {
	queryDocumentTypes {
		hits {
			_id
			_name
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
					_id
					_name
					_nodeType
					_path
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
						hits {
							_id
							_name
							_nodeType
							_path
							#_score
						}
						total
					}
					#_score
				}
				total
			}
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
				ngram
				valueType
			}
		}
	}
}`;

// NOTE indexConfig.path hath not been implemented for documentTypes
