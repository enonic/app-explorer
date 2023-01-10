import type {DslOperator} from '/lib/xp/node';
import type {
	DropdownItemProps,
	PaginationProps,
} from 'semantic-ui-react';
import type {QueryDocumentsResult} from './';


import {
	QUERY_OPERATOR_OR,
	// storage
} from '@enonic/js-utils';
import {FieldPath} from '@enonic/explorer-utils';
import {useWhenInitAsync} from '@seamusleahy/init-hooks';
import {useDebounce} from 'use-debounce';
import * as gql from 'gql-query-builder';
import {difference} from 'lodash';
import moment from 'moment';
import * as React from 'react';
// import traverse from 'traverse';
import {
	FIELD_SHORTCUT_COLLECTION,
	FIELD_SHORTCUT_DOCUMENT_TYPE,
} from '../../../services/graphQL/constants';
import useJsonModalState from '../components/modals/useJsonModalState';
import {useInterval} from '../utils/useInterval';
import {useUpdateEffect} from '../utils/useUpdateEffect';
import {
	FRAGMENT_SIZE_DEFAULT,
	PER_PAGE_DEFAULT,
	POST_TAG,
	PRE_TAG,
	SELECTED_COLUMNS_DEFAULT,
	Column,
} from './constants';
import {getColumns} from './getColumns';
import {persistColumns} from './persistColumns';


// const bool = storage.query.dsl.bool;
// const fulltext = storage.query.dsl.fulltext;
// const ngram = storage.query.dsl.ngram;
// const or = storage.query.dsl.or;
// const stemmed = storage.query.dsl.stemmed;


const DEBUG_DEPENDENCIES = false;

const GQL_INPUT_TYPE_HIGHLIGHT = 'InputTypeHighlight';


const OPTIONS_COLUMNS_DEFAULT: DropdownItemProps[] = [{
	text: 'Collection',
	value: Column.COLLECTION, // 'document_metadata.collection'
},{
	text: 'Document type',
	value: Column.DOCUMENT_TYPE, // 'document_metadata.documentType'
},{
	text: 'Language',
	value: Column.LANGUAGE, // 'document_metadata.language'
},{
	text: 'Document ID',
	value: Column.ID
},{
	text: 'JSON',
	value: Column.JSON
}];

export function useDocumentsState({
	servicesBaseUrl,
	setBottomBarMessage,
	setBottomBarMessageHeader,
	setBottomBarVisible,
} :{
	servicesBaseUrl: string
	setBottomBarMessage: React.Dispatch<React.SetStateAction<string>>
	setBottomBarMessageHeader: React.Dispatch<React.SetStateAction<string>>
	setBottomBarVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
	// console.debug('servicesBaseUrl', servicesBaseUrl);

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [documentsRes, setDocumentsRes] = React.useState<QueryDocumentsResult>({
		total: 0,
		hits: []
	});
	const {
		state: jsonModalState,
		setState: setJsonModalState
	} = useJsonModalState();
	const [collectionOptions, setCollectionOptions] = React.useState<
		DropdownItemProps[]
	>([]);
	const [collectionsHoverOpen, setCollectionsHoverOpen] = React.useState(false);
	const [columnOptions, setColumnOptions] = React.useState<
		DropdownItemProps[]
	>(OPTIONS_COLUMNS_DEFAULT);
	const [columnsHoverOpen, setColumnsHoverOpen] = React.useState(false);
	const [doing, setDoing] = React.useState('Initializing...');
	const [perPage, setPerPage] = React.useState(PER_PAGE_DEFAULT);
	const [perPageHoverOpen, setPerPageHoverOpen] = React.useState(false);
	const [documentTypeOptions, setDocumentTypeOptions] = React.useState<
		DropdownItemProps[]
	>([]);
	const [documentTypesHoverOpen, setDocumentTypesHoverOpen] = React.useState(false);
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const [
		fragmentSize,
		// setFragmentSize
	] = React.useState(FRAGMENT_SIZE_DEFAULT);
	const [deBouncedFragmentSize] = useDebounce(fragmentSize, 200);

	const [loading, setLoading] = React.useState(false);
	const [operatorState, setOperatorState] = React.useState<DslOperator>(QUERY_OPERATOR_OR);
	const [page, setPage] = React.useState(1);
	const [urlSearchParams] = React.useState(new URLSearchParams(document.location.search));
	const [query, setQuery] = React.useState<string>(urlSearchParams.get('q') || '');
	const [searchedString, setSearchedString] = React.useState<string>('');
	const [selectedCollections, setSelectedCollections] = React.useState<string[]>(
		urlSearchParams.get('collection')
			? [urlSearchParams.get('collection')]
			: []
	);
	const [selectedColumnsState, setSelectedColumnsState] = React.useState<string[]>([]/*SELECTED_COLUMNS_DEFAULT*/); // Empty until loaded from profile
	const [selectedDocumentTypes, setSelectedDocumentTypes] = React.useState<string[]>(
		urlSearchParams.get('documentType')
			? [urlSearchParams.get('documentType')]
			: []
	);
	const [start, setStart] = React.useState(0);
	const [updatedAt, setUpdatedAt] = React.useState(moment());

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks (should only depend on props, not state)
	//──────────────────────────────────────────────────────────────────────────
	const queryDocuments = React.useCallback(({
		collectionsFilter, // = [],
		documentsTypesFilter, // = [],
		fragmentSize, // = FRAGMENT_SIZE_DEFAULT,
		operator, // = QUERY_OPERATOR_OR,
		perPage, // = PER_PAGE_DEFAULT,
		query, // = '',
		selectedColumns, // = SELECTED_COLUMNS_DEFAULT,
		start, // = 0,
		// updateSelectedCollections = false,
		// updateSelectedDocumentTypes = false,
	}: {
		collectionsFilter: string[]
		documentsTypesFilter: string[]
		fragmentSize: number
		operator: DslOperator
		perPage: number
		query: string
		selectedColumns: string[]
		start: number
		// updateSelectedCollections: boolean
		// updateSelectedDocumentTypes: boolean
	}) => {
		DEBUG_DEPENDENCIES && console.debug('queryDocuments callback called');
		setDoing('Querying documents...');
		setBottomBarMessageHeader('Search');
		setBottomBarMessage(`Searching for ${query}...`);
		setBottomBarVisible(true);
		setLoading(true);
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
			const fields = jsonColumns.length ? jsonColumns.map(f => `${f}^2`): [];
			fields.push(
				// `${FIELD_PATH_META_COLLECTION}^2`,
				// `${FIELD_PATH_META_DOCUMENT_TYPE}^2`,
				// `${FIELD_PATH_META_LANGUAGE}^2`,
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
					[
						{
							field: '_allText',
							numberOfFragments: 99999 // _allText is an array, one per added field
						// },{
						// 	field: FIELD_PATH_META_COLLECTION
						// },{
						// 	field: FIELD_PATH_META_DOCUMENT_TYPE
						// },{
						// 	field: FIELD_PATH_META_LANGUAGE
						}
					],
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
								size: 0, // Seems to mean infinite (undocumented)
								minDocCount: 0,
							}
						},{
							name: 'documentTypes',
							terms: {
								field: FIELD_SHORTCUT_DOCUMENT_TYPE,
								order: '_count DESC',
								size: 0, // Seems to mean infinite (undocumented)
								minDocCount: 0,
							}
						}]
					},
					count: {
						list: false,
						required: false,
						type: 'Int',
						value: perPage
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
					},
					start: {
						list: false,
						required: false,
						type: 'Int',
						value: start
					},
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
							FieldPath.META
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
						// const newSelectedCollections = [];
						const newCollectionOptions = buckets.map(({docCount,key}) => {
							// newSelectedCollections.push(key);
							return {
								text: `${key} (${docCount})`,
								value: key
							};
						});
						setCollectionOptions(newCollectionOptions);
						// console.log('newSelectedCollections', newSelectedCollections);
						// if (updateSelectedCollections && !collectionsFilter.length) {
						// 	setSelectedCollections(newSelectedCollections);
						// }
					}
					if (name === 'documentTypes') {
						// const newSelectedDocumentTypes = [];
						const newDocumentTypeOptions = buckets.map(({docCount,key}) => {
							// newSelectedDocumentTypes.push(key);
							return {
								text: `${key} (${docCount})`,
								value: key
							};
						});
						setDocumentTypeOptions(newDocumentTypeOptions);
						// console.log('newSelectedDocumentTypes', newSelectedDocumentTypes);
						// if (updateSelectedDocumentTypes && !documentsTypesFilter.length) {
						// 	setSelectedDocumentTypes(newSelectedDocumentTypes);
						// }
					}
				} // for aggregations

				// const fields: string[] = [];
				for (let i = 0; i < hits.length; i++) {
					const {_json} = hits[i];
					let obj = {};
					try {
						obj = JSON.parse(_json);
						// console.log('_json', _json);

						// const paths = traverse(obj).paths();
						// // console.log('paths', paths);
						//
						// for (let j = 0; j < paths.length; j++) {
						// 	const pathParts = paths[j];
						// 	// console.log('pathParts', pathParts);
						//
						// 	let path = '';
						// 	partsLoop: for (let k = 0; k < pathParts.length; k++) {
						// 		const part = pathParts[k];
						// 		if (parseInt(part, 10).toString() === part) {
						// 			// console.log('isNumber', part);
						// 			path = pathParts.slice(0,k).join('.');
						// 			break partsLoop;
						// 		}
						// 	} // for partsLoop
						//
						// 	if (!path) {
						// 		path = pathParts.join('.');
						// 	}
						//
						// 	if (path && !fields.includes(path)) {
						// 		// console.log('path', path);
						// 		fields.push(path);
						// 	}
						// } // for json obj paths
					} catch(e) {
						//no-op
					}
					json.data.queryDocuments.hits[i].parsedJson = obj; // Could do this instead of then TypedReactJson.src
				} // for hits
				// fields.sort();
				// console.log('fields', fields);
				// const newColumnOptions = OPTIONS_COLUMNS_DEFAULT.concat(
				// 	fields.map((field) => ({
				// 		text: field,
				// 		value: field
				// 	}))
				// );
				// // console.log('newColumnOptions', newColumnOptions);
				// setColumnOptions(newColumnOptions);

				setDocumentsRes(json.data.queryDocuments);
				setSearchedString(query);

				const newUpdatedAt = moment();
				setDurationSinceLastUpdate(
					moment
						.duration(0)
						.humanize()
				);
				setUpdatedAt(newUpdatedAt);

				setDoing('');
				setLoading(false);
				setBottomBarVisible(false);
			});
	},[ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		servicesBaseUrl,
		setBottomBarMessage,
		setBottomBarMessageHeader,
		setBottomBarVisible,
	]);

	const getDocumentTypes = React.useCallback(() => {
		DEBUG_DEPENDENCIES && console.debug('getDocumentTypes callback called');
		setDoing('Getting documentTypes...');
		setBottomBarMessageHeader('Initialize');
		setBottomBarMessage('Fetching documentTypes...');
		setBottomBarVisible(true);
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gql.query({
				operation: 'queryDocumentTypes',
				fields: [
					{
						hits: [{
							properties: [
								'name'
							]
						}]
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
			.then(obj => {
				// console.log('json', json);
				const {
					hits = []
				} = obj.data.queryDocumentTypes;
				// console.log('hits', hits);
				const fieldPaths: string[] = [];
				for (let i = 0; i < hits.length; i++) {
					const {properties = []} = hits[i];
					for (let j = 0; j < properties.length; j++) {
						const {
							name: fieldPath
						} = properties[j];
						if (!fieldPaths.includes(fieldPath)) {
							fieldPaths.push(fieldPath);
						}
					} // for properties
				} // for hits
				fieldPaths.sort();
				// console.log('fieldPaths', fieldPaths);

				setColumnOptions(
					OPTIONS_COLUMNS_DEFAULT.concat(
						fieldPaths.map((field) => ({
							text: field,
							value: field
						}))
					)
				);
				setDoing('Getting profile...');
				getColumns({servicesBaseUrl}).then(columns => {
					// console.debug('columns', columns);
					setSelectedColumnsState(JSON.parse(JSON.stringify(columns))); // NOTE: dereffing: trying to make it work with dragNdrop columns
					queryDocuments({
						collectionsFilter: selectedCollections,
						documentsTypesFilter: selectedDocumentTypes,
						fragmentSize,
						operator: operatorState,
						perPage,
						query,
						selectedColumns: columns,
						start, // Keep start when columns changes
						// updateSelectedCollections: true,
						// updateSelectedDocumentTypes: true,
					});
				});
			});
	}, [ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		fragmentSize,
		operatorState,
		perPage,
		query,
		queryDocuments,
		selectedCollections,
		selectedDocumentTypes,
		servicesBaseUrl,
		setBottomBarMessage,
		setBottomBarMessageHeader,
		setBottomBarVisible,
		start
	]);

	const handlePaginationChange = React.useCallback((
		_event: React.MouseEvent<HTMLAnchorElement>,
		data: PaginationProps
	) => {
		const {activePage: newPage} = data;
		DEBUG_DEPENDENCIES && console.debug('handlePaginationChange callback called. newPage:', newPage);
		setPage(newPage as number);
		const newStart = (newPage as number - 1 ) * perPage;
		if (newStart !== start) {
			setStart(newStart)
		}
		queryDocuments({
			collectionsFilter: selectedCollections,
			documentsTypesFilter: selectedDocumentTypes,
			fragmentSize,
			operator: operatorState,
			perPage,
			query,
			selectedColumns: selectedColumnsState,
			start: newStart
		});
	}, [ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		fragmentSize,
		operatorState,
		perPage,
		query,
		queryDocuments,
		selectedCollections,
		selectedColumnsState,
		selectedDocumentTypes,
		start
	]);

	const persistSelectedColumns = React.useCallback((newSelectedColumns: string[]) => {
		DEBUG_DEPENDENCIES && console.debug('persistSelectedColumns callback called');
		setBottomBarMessageHeader('Settings');
		setBottomBarMessage('Storing selected columns...');
		setBottomBarVisible(true);
		setDoing('Persisting selected columns...');
		// setSelectedColumnsState(JSON.parse(JSON.stringify(newSelectedColumns)));
		setLoading(true);
		persistColumns({
			columns: newSelectedColumns,
			getColumns,
			servicesBaseUrl
		}).then((/*columns*/) => {
			setDoing('');
			setLoading(false);
			setBottomBarVisible(false);
		});
	}, [ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		servicesBaseUrl,
		setBottomBarMessage,
		setBottomBarMessageHeader,
		setBottomBarVisible,
	]);

	function handleDroppedColumn({
		fromId,
		toId
	}: {
		fromId: string
		toId: string
	}) {
		setSelectedColumnsState(prev => {
			const fromIndex = prev.indexOf(fromId);
			const toIndex = prev.indexOf(toId);
			DEBUG_DEPENDENCIES && console.debug(
				'handleDroppedColumn fromId', fromId,
				'fromIndex', fromIndex,
				'toId', toId,
				'toIndex', toIndex,
				'prev', prev,
				// 'selectedColumnsState', selectedColumnsState // WARNING: For some reason this doesn't change !!!
			);
			const newSelectedColumns = JSON.parse(JSON.stringify(prev)) as typeof prev; // deref was a bad idea?
			const element = newSelectedColumns[fromIndex];
			// console.debug('newSelectedColumns before', newSelectedColumns, 'element', element);
			newSelectedColumns.splice(fromIndex, 1); // Remove 1 element from array
			// console.debug('newSelectedColumns underway', newSelectedColumns);
			newSelectedColumns.splice(toIndex, 0, element); // Insert element at new position
			// console.debug('newSelectedColumns after', newSelectedColumns);
			return newSelectedColumns;
		});
	}

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		DEBUG_DEPENDENCIES && console.debug('init');
		getDocumentTypes()
	});

	//──────────────────────────────────────────────────────────────────────────
	// Effects (init and changes)
	//──────────────────────────────────────────────────────────────────────────
	// React.useEffect(() => {
	// 	console.debug('doing', doing);
	// }, [
	// 	doing
	// ]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates (changes, not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		DEBUG_DEPENDENCIES && console.debug('updateEffect[selectedColumnsState] triggered. selectedColumnsState', selectedColumnsState);
		persistSelectedColumns(selectedColumnsState);
	}, [
		selectedColumnsState
	])

	useUpdateEffect(() => {
		DEBUG_DEPENDENCIES && console.debug('updateEffect[deBouncedFragmentSize] triggered. deBouncedFragmentSize', deBouncedFragmentSize);
		queryDocuments({
			collectionsFilter: selectedCollections,
			documentsTypesFilter: selectedDocumentTypes,
			fragmentSize: deBouncedFragmentSize,
			operator: operatorState,
			perPage,
			query,
			selectedColumns: selectedColumnsState,
			start // Keep start when fragmentSize changes
		});
	}, [
		deBouncedFragmentSize,
		queryDocuments,
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Intervals
	//──────────────────────────────────────────────────────────────────────────
	useInterval(() => {
		// DEBUG_DEPENDENCIES && console.debug('useInterval triggered');
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, 5000);

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
		doing, // setDoing,
		durationSinceLastUpdate, // setDurationSinceLastUpdate,
		fragmentSize, // setFragmentSize,
		handleDroppedColumn,
		handlePaginationChange,
		jsonModalState, setJsonModalState,
		loading, // setLoading,
		operatorState, setOperatorState,
		page, setPage,
		perPage, setPerPage,
		perPageHoverOpen, setPerPageHoverOpen,
		query, setQuery,
		queryDocuments,
		searchedString, // setSearchedString,
		selectedCollections, setSelectedCollections,
		selectedColumnsState, setSelectedColumnsState,
		selectedDocumentTypes, setSelectedDocumentTypes,
		start, setStart,
	};
}
