export const GQL_QUERY_EXPLORER_REPO_NODES_GET = `query GetExplorerRepoNodesQuery(
	$count: Int
	$nodeTypes: [String]
	$query: String
	$start: Int
) {
	getExplorerRepoNodes(
		count: $count
		nodeTypes: $nodeTypes
		query: $query
		start: $start
	) {
		count
		total
		hits {
			#__typename
			... on Collection {
				_id
				_name
				_nodeType
				_path
				_versionKey
				collector {
					name
					#configJson
				}
				documentTypeId
				interfaces
				collectionLanguage: language
			}
			... on DocumentType {
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
			}
			... on FieldNode {
				_id
				_name
				_nodeType
				_path
				_versionKey
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
			}
			... on Interface {
				_id
				_name
				_nodeType
				_path
				_versionKey
				collectionIds
				fields {
					boost
					name
				}
				stopWords
				synonymIds
			}
			#... on Node {} # Have not investigated why this is autocompleted
			... on StopWords {
				_id
				_name
				_nodeType
				_path
				_versionKey
				displayName
				words
			}
			... on Thesaurus {
				_id
				_name
				_nodeType
				_path
				_versionKey
				thesaurusLanguage: language {
					from
					to
				}
			}
		}
	}
}`;

/* Example variables:
{
	"count": 1,
	"nodeTypes": [
		"com.enonic.app.explorer:collection",
		"com.enonic.app.explorer:documentType",
		"com.enonic.app.explorer:field",
		"com.enonic.app.explorer:interface",
		"com.enonic.app.explorer:stop-words",
		"com.enonic.app.explorer:thesaurus"
	],
	"query": "",
	"start": 0
}
*/
