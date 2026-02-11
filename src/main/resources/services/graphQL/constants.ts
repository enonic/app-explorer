export {
	FILEPATH_MANIFEST,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT
} from '../../constants';

export const SERVICE_NAME = 'graphQL';


//──────────────────────────────────────────────────────────────────────────────

// [_A-Za-z][_0-9A-Za-z]*

export const FIELD_SHORTCUT_COLLECTION = '_collectionName';
export const FIELD_SHORTCUT_DOCUMENT_TYPE = '_documentTypeName';

export const GQL_UNIQ_TYPE = {
	ENUM_SORT_DIRECTION: 'SortDirection',
	ENUM_CONTENT_TYPES_SORT_FIELD: 'ContentTypesSortField',
	ENUM_SCHEMA_TYPE: 'SchemaType',
	ENUM_VALUE_TYPES: 'ValueTypes',
	INPUT_CONTENT_TYPES_SORT: 'SortContentTypes',
	INPUT_FIELD_SORT_DSL: 'FieldSortDsl',
	INPUT_QUERY_DSL: 'QueryDSL',
	INPUT_QUERY_DSL_BOOLEAN: 'QueryDSLBoolean',
	INPUT_QUERY_DSL_EXPRESSION_FULLTEXT: 'QueryDSLExpressionFulltext',
	INPUT_QUERY_DSL_EXPRESSION_MATCH_ALL: 'QueryDSLExpressionMatchAll',
	INPUT_QUERY_DSL_EXPRESSION_NGRAM: 'QueryDSLExpressionNgram',
	INPUT_QUERY_DSL_EXPRESSION_STEMMED: 'QueryDSLExpressionStemmed',
	INPUT_QUERY_DSL_TERM_EXPRESSION: 'QueryDSLTermExpression',
	OBJECT_ATTACHMENT: 'Attachment',
	OBJECT_APPLICATION: 'Application',
	OBJECT_CONTENT: 'Content',
	OBJECT_CONTENT_QUERY_RESULT: 'ContentQueryResult',
	OBJECT_CONTENT_TYPE: 'ContentType',
	OBJECT_CONTENT_TYPE_ICON: 'ContentTypeIcon',
	OBJECT_SCHEMA_CONTENT: 'SchemaContent',
	OBJECT_SITE: 'Site',
	OBJECT_SITES_GET: 'GetSites',
	OBJECT_PROJECT: 'Project',
	OBJECT_PROJECT_PERMISSION: 'ProjectPermission',
	OBJECT_PROJECT_READ_ACCESS: 'ProjectReadAccess',
	QUERY_APP_GET: 'getApp',
	QUERY_APP_LIST: 'listApps',
	QUERY_CONTENT_TYPES_GET: 'getContentTypes',
	QUERY_CONTENT_QUERY: 'queryContents',
	QUERY_PROJECT_LIST: 'listProjects',
	QUERY_SCHEMA_LIST: 'listSchemas',
	QUERY_SITES_GET: 'getSites',
} as const;


export const GQL_ENUM_TASK_STATES = 'EnumTaskStates';

export const GQL_FIELDS_DOCUMENT_TYPE_PROPERTY_NAME = 'DocumentTypePropertyFields';

//──────────────────────────────────────────────────────────────────────────────
// Input type names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_INPUT_TYPE_AGGREGATION = 'AggregationInput';
export const GQL_INPUT_TYPE_AGGREGATION_TERMS = 'AggregationTermsInput';
export const GQL_INPUT_TYPE_AGGREGATION_COUNT = 'AggregationCountInput';

export const GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME = 'CollectionCollectorInput';
export const GQL_INPUT_TYPE_COLLECTION_CRON_NAME = 'CollectionCronInput';

export const GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME = 'DocumentTypePropertiesInput';

export const GQL_INPUT_TYPE_FILTERS_NAME = 'Filters';
export const GQL_INPUT_TYPE_FILTERS_BOOLEAN_NAME = 'FiltersBoolean';

export const GQL_INPUT_TYPE_INTERFACE_FIELD_NAME = 'InterfaceFieldInput';
export const GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME = 'InterfaceTermQueryInput';

export const GQL_INPUT_TYPE_QUERY_DSL_BOOLEAN_CLAUSE = 'QueryDSLBooleanClause';

export const GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME = 'SynonymLanguageInput';

//──────────────────────────────────────────────────────────────────────────────

export const GQL_TYPE_API_KEY_NAME = 'ApiKey';

//──────────────────────────────────────────────────────────────────────────────
// Interface type names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_INTERFACE_NODE_NAME = 'Node';
export const GQL_INTERFACE_PRINCIPAL_NAME = 'PrincipalInterface';
export const GQL_INTERFACE_QUERY_RESULT_NAME = 'QueryResult';

//──────────────────────────────────────────────────────────────────────────────
// Object type names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_TYPE_AGGREGATION_TERMS_NAME = 'AggregationTerms';
export const GQL_TYPE_AGGREGATION_TERMS_BUCKET_NAME = 'AggregationTermsBucket';

export const GQL_TYPE_COLLECTION_COLLECTOR_NAME = 'CollectionCollector';
export const GQL_TYPE_COLLECTION_NAME = 'Collection';
export const GQL_TYPE_COLLECTION_REINDEX_REPORT = 'CollectionReindexReport';
export const GQL_TYPE_COLLECTIONS_QUERY_RESULT = 'CollectionsQueryResult';

export const GQL_TYPE_DOCUMENT_NAME = 'Document';
export const GQL_TYPE_DOCUMENT_QUERY_RESULT_NAME = 'DocumentQueryResult';
export const GQL_TYPE_DOCUMENT_QUERY_RESULT_FIELD_COUNT = 'DocumentQueryResultFieldCount';

export const GQL_TYPE_DOCUMENT_TYPE_NAME = 'DocumentType';
export const GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME = 'DocumentTypeQueryResult';

export const GQL_TYPE_EXPLORER_QUERY_RESULT_NAME = 'ExplorerQueryResult';

export const GQL_TYPE_FIELD_NODE_NAME = 'FieldNode';
export const GQL_TYPE_FIELDS_QUERY_RESULT_NAME = 'FieldsQueryResult';

export const GQL_TYPE_GROUP_NAME = 'Group';

export const GQL_TYPE_HAS_FIELD_QUERY_RESULT_NAME = 'HasFieldQueryResult';

export const GQL_TYPE_INTERFACE_NAME = 'Interface';
export const GQL_TYPE_INTERFACE_FIELD_NAME = 'InterfaceField';
export const GQL_TYPE_INTERFACE_TERM_QUERY_NAME = 'InterfaceTermQuery';

export const GQL_TYPE_JOB_NAME = 'ScheduledJob';
export const GQL_TYPE_NODE_DELETED_NAME = 'NodeDeleted';

export const GQL_TYPE_PRINCIPAL_NAME = 'Principal';

export const GQL_TYPE_REFERENCED_BY_NAME = 'ReferencedBy';
export const GQL_OBJECT_TYPE_NAME_REPO = 'Repo';
export const GQL_TYPE_ROLE_NAME = 'Role';

export const GQL_TYPE_STOP_WORDS_NAME = 'StopWords';
export const GQL_TYPE_STOP_WORDS_QUERY_RESULT_NAME = 'StopWordsQueryResult';

export const GQL_TYPE_SYNONYM_NAME = 'Synonym';
export const GQL_TYPE_SYNONYM_QUERIED_NAME = 'SynonymQueried';
export const GQL_TYPE_SYNONYMS_QUERY_RESULT_NAME = 'SynonymsQueryResult';
export const GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_NAME = 'SynonymsQueryResultAggregations';
export const GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_NAME = 'SynonymsQueryResultAggregationsThesaurus';
export const GQL_TYPE_SYNONYMS_QUERY_RESULT_AGGREGATIONS_THESAURUS_BUCKET_NAME = 'SynonymsQueryResultAggregationsThesaurusBucket';

export const GQL_TYPE_TASK = 'Task';
export const GQL_TYPE_TASK_SUBMITTED = 'SubmittedTask';

export const GQL_TYPE_THESAURI_QUERY_HITS = 'ThesauriQueryHits';
export const GQL_TYPE_THESAURI_QUERY_RESULT = 'ThesauriQueryResult';
export const GQL_TYPE_THESAURUS_NAME = 'Thesaurus';
export const GQL_TYPE_USER_NAME = 'User';

//──────────────────────────────────────────────────────────────────────────────
// Union type names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_UNION_TYPE_ANY_NODE = 'AnyNode';
export const GQL_UNION_TYPE_GROUP_OR_ROLE = 'GroupOrRoleUnion';

//──────────────────────────────────────────────────────────────────────────────
// Mutation field names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_MUTATION_API_KEY_CREATE_NAME = 'createApiKey';
export const GQL_MUTATION_API_KEY_DELETE_NAME = 'deleteApiKey';
export const GQL_MUTATION_API_KEY_UPDATE_NAME = 'updateApiKey';
export const GQL_MUTATION_COLLECTION_COPY_NAME = 'copyCollection';
export const GQL_MUTATION_COLLECTION_DELETE_NAME = 'deleteCollection';
export const GQL_MUTATION_INTERFACE_CREATE_NAME = 'createInterface';
export const GQL_MUTATION_INTERFACE_DELETE_NAME = 'deleteInterface';
export const GQL_MUTATION_INTERFACE_UPDATE_NAME = 'updateInterface';
export const GQL_MUTATION_STOP_WORDS_CREATE_NAME = 'createStopWords';
export const GQL_MUTATION_STOP_WORDS_DELETE_NAME = 'deleteStopWords';
export const GQL_MUTATION_STOP_WORDS_UPDATE_NAME = 'updateStopWords';
export const GQL_MUTATION_THESAURUS_IMPORT_NAME = 'importThesaurus';

//──────────────────────────────────────────────────────────────────────────────
// Query field names
//──────────────────────────────────────────────────────────────────────────────
export const GQL_QUERY_COLLECTIONS = 'queryCollections';
export const GQL_QUERY_COLLECTOR_GET_MANAGED_DOCUMENT_TYPES = 'getManagedDocumentTypes';
export const GQL_QUERY_DOCUMENTS = 'queryDocuments';
export const GQL_QUERY_EXPLORER_REPO_NODES_GET_NAME = 'getExplorerRepoNodes';
export const GQL_QUERY_INTERFACE_GET_NAME = 'getInterface';
export const GQL_QUERY_FIELD_GET_NAME = 'getField';
export const GQL_QUERY_NAME_LIST_REPOS = 'listRepos';
export const GQL_QUERY_MEMBERS_GET_NAME = 'getMembers';
export const GQL_QUERY_MEMBERSHIPS_GET_NAME = 'getMemberships';
export const GQL_QUERY_PROFILE_GET_NAME = 'getProfile';
export const GQL_QUERY_PROFILE_MODIFY_NAME = 'modifyProfile';
export const GQL_QUERY_SYNONYMS_NAME = 'querySynonyms';
export const GQL_QUERY_USER_GET_NAME = 'getUser';
