export function buildGetThesauriQuery() {
	return `queryThesauri {
	total
	count
	hits {
		_id
		_name
		_nodeType
		_nodeTypeVersion
		_path
		_versionKey
		description
		language {
			from
			to
		}
		synonyms {
			total
			count
			hits {
				_id
				_name
				_nodeType
				_path
				displayName
				from
				thesaurus
				thesaurusReference
				to
			}
		}
		synonymsCount
	}
}`;
}
