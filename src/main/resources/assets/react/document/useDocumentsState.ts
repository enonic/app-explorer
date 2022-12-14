import type {DslOperator} from '/lib/xp/node';
import type {DropdownItemProps} from 'semantic-ui-react';
import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';


import {
	QUERY_OPERATOR_OR,
	forceArray,
	// storage
} from '@enonic/js-utils';
import {useDebounce} from 'use-debounce';
import * as gql from 'gql-query-builder';
import {difference} from 'lodash';
import moment from 'moment';
import * as React from 'react';
import traverse from 'traverse';
// import {
// 	FIELD_PATH_META,
// 	FIELD_PATH_META_COLLECTION,
// 	FIELD_PATH_META_DOCUMENT_TYPE,
// 	FIELD_PATH_META_LANGUAGE
// } from '/lib/explorer/constants'; // WARNING lib explorer can't be imported client-side because the files only exists inside the jar...
import {
	FIELD_SHORTCUT_COLLECTION,
	FIELD_SHORTCUT_DOCUMENT_TYPE,
} from '../../../services/graphQL/constants';
import {useInterval} from '../utils/useInterval';


// const bool = storage.query.dsl.bool;
// const fulltext = storage.query.dsl.fulltext;
// const ngram = storage.query.dsl.ngram;
// const or = storage.query.dsl.or;
// const stemmed = storage.query.dsl.stemmed;


const FIELD_PATH_META = 'document_metadata' as const; // TODO _meta ?
export const FIELD_PATH_META_COLLECTION = `${FIELD_PATH_META}.collection` as const;
export const FIELD_PATH_META_DOCUMENT_TYPE = `${FIELD_PATH_META}.documentType` as const;
export const FIELD_PATH_META_LANGUAGE = `${FIELD_PATH_META}.language` as const;
const GQL_INPUT_TYPE_HIGHLIGHT = 'InputTypeHighlight';


export const COLUMN_NAME_COLLECTION = '_collection';
export const COLUMN_NAME_DOCUMENT_TYPE = '_documentType';
export const COLUMN_NAME_ID = '_id';
export const COLUMN_NAME_JSON = '_json';
export const COLUMN_NAME_LANGUAGE = '_language';
export const FRAGMENT_SIZE_DEFAULT = 150;

export const POST_TAG = '</b>';
export const PRE_TAG = '<b class="bgc-y">';

export const SELECTED_COLUMNS_DEFAULT = [
	COLUMN_NAME_COLLECTION,
	COLUMN_NAME_DOCUMENT_TYPE,
	COLUMN_NAME_LANGUAGE,
	COLUMN_NAME_ID,
	COLUMN_NAME_JSON,
];

const OPTIONS_COLUMNS_DEFAULT: DropdownItemProps[] = [{
	text: 'Collection',
	value: COLUMN_NAME_COLLECTION, // 'document_metadata.collection'
},{
	text: 'Document type',
	value: COLUMN_NAME_DOCUMENT_TYPE, // 'document_metadata.documentType'
},{
	text: 'Language',
	value: COLUMN_NAME_LANGUAGE, // 'document_metadata.language'
},{
	text: 'Document ID',
	value: COLUMN_NAME_ID
},{
	text: 'JSON',
	value: COLUMN_NAME_JSON
}]

export function useDocumentsState({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	// console.debug('servicesBaseUrl', servicesBaseUrl);

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [documentsRes, setDocumentsRes] = React.useState({
		total: 0,
		hits: []
	});
	const [jsonModalState, setJsonModalState] = React.useState<{
		open: boolean
		id: string
		parsedJson: Record<string,unknown>
	}>({
		open: false,
		id: '',
		parsedJson: undefined,
	});
	const [collectionOptions, setCollectionOptions] = React.useState<
		DropdownItemProps[]
	>([]);
	const [collectionsHoverOpen, setCollectionsHoverOpen] = React.useState(false);
	const [columnOptions, setColumnOptions] = React.useState<
		DropdownItemProps[]
	>(OPTIONS_COLUMNS_DEFAULT);
	const [columnsHoverOpen, setColumnsHoverOpen] = React.useState(false);
	const [documentTypeOptions, setDocumentTypeOptions] = React.useState<
		DropdownItemProps[]
	>([]);
	const [documentTypesHoverOpen, setDocumentTypesHoverOpen] = React.useState(false);
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const [fragmentSize, setFragmentSize] = React.useState(FRAGMENT_SIZE_DEFAULT);
	const [deBouncedFragmentSize] = useDebounce(fragmentSize, 200);

	const [loading, setLoading] = React.useState(false);
	const [operatorState, setOperatorState] = React.useState<DslOperator>(QUERY_OPERATOR_OR);
	const [query, setQuery] = React.useState<string>('');
	const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);
	const [selectedColumns, setSelectedColumns] = React.useState(SELECTED_COLUMNS_DEFAULT);
	const [selectedDocumentTypes, setSelectedDocumentTypes] = React.useState<string[]>([]);
	const [updatedAt, setUpdatedAt] = React.useState(moment());

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks
	//──────────────────────────────────────────────────────────────────────────
	const queryDocuments = React.useCallback(({
		collectionsFilter = [],
		documentsTypesFilter = [],
		fragmentSize = FRAGMENT_SIZE_DEFAULT,
		operator = QUERY_OPERATOR_OR,
		query = '',
		selectedColumns = SELECTED_COLUMNS_DEFAULT,
		updateSelectedCollections = false,
		updateSelectedDocumentTypes = false,
	}: {
		collectionsFilter?: string[]
		documentsTypesFilter?: string[]
		fragmentSize?: number
		operator?: DslOperator
		query?: string
		selectedColumns?: string[]
		updateSelectedCollections?: boolean
		updateSelectedDocumentTypes?: boolean
	}) => {
		setLoading(true);
		// console.debug('queryDocuments');
		const filters = [];
		if (collectionsFilter.length) {
			filters.push({
				hasValue: {
					field: 'document_metadata.collection',
					stringValues: collectionsFilter
				}
			})
		}
		if (documentsTypesFilter.length) {
			filters.push({
				hasValue: {
					field: 'document_metadata.documentType',
					stringValues: documentsTypesFilter
				}
			})
		}

		const jsonColumns = difference(selectedColumns, SELECTED_COLUMNS_DEFAULT);

		let queryValue = null;
		if (query) {
			const fields = jsonColumns.length ? jsonColumns.map(f => `${f}^3`): [];
			fields.push(
				`${FIELD_PATH_META_COLLECTION}^2`,
				`${FIELD_PATH_META_DOCUMENT_TYPE}^2`,
				`${FIELD_PATH_META_LANGUAGE}^2`,
				'_allText', // WARNING: Frequently fields are not duplicated into _allText
			)
			// queryValue = bool(or(
			// 	fulltext(fields, query, operator, 1.1),
			// 	stemmed(fields, query, operator, 'en'),
			// 	stemmed(fields, query, operator, 'no'),
			// 	ngram(fields, query, operator, 0.9)
			// ));
			queryValue = {
				boolean: {
					should: [{
						fulltext: {
							boost: 1.1,
							fields,
							operator,
							query
						},
					},{
						stemmed: {
							fields,
							operator,
							query,
							language: 'en' // TODO hardcode
						},
					},{
						stemmed: {
							fields,
							operator,
							query,
							language: 'no' // TODO hardcode
						},
					},{
						ngram: {
							boost: 0.9,
							fields,
							operator,
							query
						}
					}]
				}
			}
			// console.log('queryValue', queryValue);
		}

		const highlight = {
			list: false,
			required: false,
			type: GQL_INPUT_TYPE_HIGHLIGHT,
			value: {
				encoder: 'html',
				fields: [].concat(
					[{
					// 	field: '_allText',
					// 	numberOfFragments: 99999 // _allText is an array, one per added field
					// },{
						field: FIELD_PATH_META_COLLECTION
					},{
						field: FIELD_PATH_META_DOCUMENT_TYPE
					},{
						field: FIELD_PATH_META_LANGUAGE
					}],
					jsonColumns.map(
						field => ({
							field
						})
					)
				),
				fragmentSize,
				// noMatchSize: fragmentSize // FRAGMENT_SIZE_DEFAULT, // The amount of characters you want to return from the beginning of the property if there are no matching fragments to highlight. Defaults to 0 (nothing is returned).
				numberOfFragments: 1,
				order: 'score',
				postTag: POST_TAG,
				preTag: PRE_TAG
			}
		};
		// console.log('highlight', highlight);

		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gql.query({
				operation: 'queryDocuments',
				variables: {
					aggregations: {
						list: true,
						required: false,
						type: 'AggregationInput',
						value: [{
							name: 'collections',
							terms: {
								field: FIELD_SHORTCUT_COLLECTION,
								order: '_count DESC',
								size: 100,
								minDocCount: 0,
							}
						},{
							name: 'documentTypes',
							terms: {
								field: FIELD_SHORTCUT_DOCUMENT_TYPE,
								order: '_count DESC',
								size: 100,
								minDocCount: 0,
							}
						}]
					},
					filters: {
						list: true,
						required: false,
						type: 'FilterInput',
						value: filters
					},
					highlight,
					query: {
						list: false,
						required: false,
						type: 'QueryDSL',
						value: queryValue
					}
				}, // variables
				fields: [
					{
						aggregations: [
							'name',
							{
								buckets: [
									'docCount',
									'key'
								]
							}
						]
					},
					'total',
					{
						hits: [
							'_highlight',
							'_id',
							'_json',
							FIELD_PATH_META
						]
					}
				]
			}))
		})
			.then(res => res.json() /*as JSONResponse<{ // TODO
				queryDocuments: {
					aggregations:
					hits:
				}
			}>*/)
			.then(json => {
				// console.log('json', json);
				const {
					aggregations = [],
					hits = []
				} = json.data.queryDocuments;

				for (let i = 0; i < aggregations.length; i++) {
					const {
						name,
						buckets = []
					} = aggregations[i];
					if (name === 'collections') {
						const newSelectedCollections = [];
						const newCollectionOptions = buckets.map(({docCount,key}) => {
							newSelectedCollections.push(key);
							return {
								text: `${key} (${docCount})`,
								value: key
							};
						});
						setCollectionOptions(newCollectionOptions);
						// console.log('newSelectedCollections', newSelectedCollections);
						if (updateSelectedCollections) {
							setSelectedCollections(newSelectedCollections);
						}
					}
					if (name === 'documentTypes') {
						const newSelectedDocumentTypes = [];
						const newDocumentTypeOptions = buckets.map(({docCount,key}) => {
							newSelectedDocumentTypes.push(key);
							return {
								text: `${key} (${docCount})`,
								value: key
							};
						});
						setDocumentTypeOptions(newDocumentTypeOptions);
						// console.log('newSelectedDocumentTypes', newSelectedDocumentTypes);
						if (updateSelectedDocumentTypes) {
							setSelectedDocumentTypes(newSelectedDocumentTypes);
						}
					}
				} // for aggregations

				const fields: string[] = [];
				for (let i = 0; i < hits.length; i++) {
					const {_json} = hits[i];
					let obj = {};
					try {
						obj = JSON.parse(_json);
						// console.log('_json', _json);

						const paths = traverse(obj).paths();
						// console.log('paths', paths);

						for (let j = 0; j < paths.length; j++) {
							const pathParts = paths[j];
							// console.log('pathParts', pathParts);

							let path = '';
							partsLoop: for (let k = 0; k < pathParts.length; k++) {
								const part = pathParts[k];
								if (parseInt(part, 10).toString() === part) {
									// console.log('isNumber', part);
									path = pathParts.slice(0,k).join('.');
									break partsLoop;
								}
							} // for partsLoop

							if (!path) {
								path = pathParts.join('.');
							}

							if (path && !fields.includes(path)) {
								// console.log('path', path);
								fields.push(path);
							}
						} // for json obj paths
					} catch(e) {
						//no-op
					}
					json.data.queryDocuments.hits[i].parsedJson = obj; // Could do this instead of then TypedReactJson.src
				} // for hits
				fields.sort();
				// console.log('fields', fields);
				const newColumnOptions = OPTIONS_COLUMNS_DEFAULT.concat(
					fields.map((field) => ({
						text: field,
						value: field
					}))
				);
				// console.log('newColumnOptions', newColumnOptions);
				setColumnOptions(newColumnOptions);

				setDocumentsRes(json.data.queryDocuments);
				setUpdatedAt(moment());
				setLoading(false);
			});
	},[
		servicesBaseUrl,
		setDocumentsRes,
	]);

	const persistSelectedColumns = React.useCallback((newSelectedColumns: string[]) => {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gql.mutation({
				operation: 'modifyProfile',
				variables: {
					object: {
						list: false,
						required: true,
						type: 'JSON',
						value: {
							columns: newSelectedColumns
						}
					},
					scope: {
						list: false,
						required: true,
						type: 'String',
						value: 'documents'
					}
				}
			}))
		})
			.then(res => res.json() as JSONResponse<{
				modifyProfile: {
					columns: string[]
				}
			}>)
			.then(json => {
				// console.log('json', json);
				const {
					columns = SELECTED_COLUMNS_DEFAULT
				} = json.data.modifyProfile;
				// console.log('columns', columns);
				setSelectedColumns(forceArray(columns));
				setLoading(false);
			});
	}, [
		servicesBaseUrl
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Effects
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gql.query({
				operation: 'getProfile'
			}))
		})
			.then(res => res.json() as JSONResponse<{
				getProfile: {
					documents: {
						columns: string[]
					}
				}
			}>)
			.then(object => {
				// console.log('object', object);
				const {
					documents: {
						columns = SELECTED_COLUMNS_DEFAULT
					} = {}
				} = object.data.getProfile || {};
				// console.log('columns', columns);
				const newSelectedColumns = forceArray(columns);
				setSelectedColumns(newSelectedColumns);
				queryDocuments({
					selectedColumns: newSelectedColumns,
					updateSelectedCollections: true,
					updateSelectedDocumentTypes: true,
				});
			});
	}, [
		queryDocuments, // changes if servicesBaseUrl or setDocumentsRes changes
		servicesBaseUrl
	]); // Only once

	React.useEffect(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, [
		updatedAt
	]);

	useInterval(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, 5000);

	React.useEffect(() => {
		// console.debug('deBouncedFragmentSize', deBouncedFragmentSize);
		queryDocuments({
			collectionsFilter: selectedCollections,
			documentsTypesFilter: selectedDocumentTypes,
			fragmentSize: deBouncedFragmentSize,
			operator: operatorState,
			query,
			selectedColumns
		});
	}, [
		deBouncedFragmentSize,
		// operatorState,
		// query,
		queryDocuments,
		// selectedCollections,
		// selectedColumns,
		// selectedDocumentTypes,
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Returns
	//──────────────────────────────────────────────────────────────────────────
	return {
		collectionOptions, // setCollectionOptions,
		collectionsHoverOpen, setCollectionsHoverOpen,
		columnsHoverOpen, setColumnsHoverOpen,
		columnOptions, // setColumnOptions,
		documentsRes, // setDocumentsRes,
		documentTypeOptions, // setDocumentTypeOptions,
		documentTypesHoverOpen, setDocumentTypesHoverOpen,
		durationSinceLastUpdate, // setDurationSinceLastUpdate,
		fragmentSize, setFragmentSize,
		jsonModalState, setJsonModalState,
		loading, // setLoading,
		operatorState, setOperatorState,
		query, setQuery,
		queryDocuments,
		selectedCollections, setSelectedCollections,
		selectedColumns, persistSelectedColumns,
		selectedDocumentTypes, setSelectedDocumentTypes,
		// updatedAt, setUpdatedAt,
	};
}
