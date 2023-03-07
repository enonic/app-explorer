import type {
	Interface,
	InterfaceField,
	TermQuery
} from '@enonic-types/lib-explorer/Interface.d';
import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions.d';
import type {DropdownItemProps} from 'semantic-ui-react/index.d';
import type {
	FieldPathToValueOptions,
	GetFieldValuesParams,
	InterfaceNamesObj,
} from './index.d';


import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_LONG,
	VALUE_TYPE_STRING,
	isSet
} from '@enonic/js-utils';
import {useWhenInitAsync} from '@seamusleahy/init-hooks';
import {useWhenValuesChange} from '@seamusleahy/values-changes-hooks';
import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder';
import {useManualQuery} from 'graphql-hooks';
import * as React from 'react';
import {FIELD_SHORTCUT_COLLECTION} from '../../../services/graphQL/constants';
// import {DEFAULT_INTERFACE_FIELDS} from '../constants';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';
// import {useUpdateEffect} from '../utils/useUpdateEffect';


export interface QueryCollectionsResponseData {
	queryCollections: {
		hits: {
			_id: string
			// _name: string
		}[]
	}
}

const GQL_QUERY_COLLECTIONS = gql.query({
	operation: 'queryCollections',
	fields: [{
		hits: [
			'_id',
			// '_name', // TODO Perhaps use this to build collectionOptions, or use some kind of auto updating cache via graphql-hooks
		]
	}]
});

export const QUERY_VALUE_TYPE_OPTIONS = [
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_LONG,
	VALUE_TYPE_STRING
].map((text) => ({text, value:text}) as DropdownItemProps)

function buildGetInterfaceQueryObject({
	_id
} :{
	_id :string
}) {
	return {
		operation: 'getInterface',
		fields: [
			//'_id',
			'_name',
			//'_path',
			//'_versionKey',
			'collectionIds',
			{
				fields: [
					'boost',
					'name'
				]
			},
			'stopWords',
			'synonymIds',
			{
				termQueries: [
					'boost',
					'field',
					'booleanValue',
					'doubleValue',
					'longValue',
					'stringValue',
					'type',
				]
			},
		],
		variables: {
			_id: {
				required: true,
				type: 'ID',
				value: _id
			}
		}
	};
} // buildGetInterfaceQueryObject


function buildQueryDocumentsObject({
	collectionIds = []
} :{
	collectionIds ?:string[]
}) {
	return {
		operation: 'queryDocuments',
		fields: [
			/*{
				aggregations: [
					'name',
					{
						buckets: [
							'docCount',
							'key'
						]
					}
				]
			},*/
			{
				fieldValueCounts: [
					'count',
					'fieldPath'
				]
			}
		],
		variables: {
			aggregations: {
				list: true,
				type: 'AggregationInput',
				value: [{
					name: 'collections',
					terms: {
						field: FIELD_SHORTCUT_COLLECTION,
						minDocCount: 0,
						order: '_term ASC',
						// Has to be the greater than or equal to the number of collections.
						size: 0 // Seems to mean infinite (undocumented)
					}
				}]
			},
			collectionIds: {
				list: true,
				type: 'ID',
				value: collectionIds
			},
			count: {
				type: 'Int',
				value: 0
			},
			countFieldValues: {
				type: 'Boolean',
				value: true
			}
		}
	};
} // buildQueryDocumentsObject


export function useNewOrEditInterfaceState({
	servicesBaseUrl,
	_id,
	interfaceNamesObj
} :{
	servicesBaseUrl :string
	_id ?:string
	interfaceNamesObj ?:InterfaceNamesObj
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [fetchCollections, {
		loading: isFetchingCollections,
		// error,
		data: fetchCollectionsData
	}] = useManualQuery<QueryCollectionsResponseData>(GQL_QUERY_COLLECTIONS.query);

	const [name, setName] = React.useState('');
	const [nameError, setNameError] = React.useState<string>();
	const [nameVisited, setNameVisited] = React.useState(false);

	const [collectionIdsFromStorage, setCollectionIdsFromStorage] = React.useState<string[]>([]);
	const [nonExistantCollectionIds, setNonExistantCollectionIds] = React.useState<string[]>([]);

	const [fieldButtonVisible, setFieldButtonVisible] = React.useState(_id ? false : true); // This is used to make nice transition when adding first/remoing last
	const [fieldOptions, setFieldOptions] = React.useState<DropdownItemProps[]>([]);
	const [fields, setFields] = React.useState<InterfaceField[]>([]);
	const [fieldValueOptions, setFieldValueOptions] = React.useState<FieldPathToValueOptions>({});
	// const [boost, setBoost] = React.useState<BoostDSL[]>([]);
	const [termQueries, setTermQueries] = React.useState<TermQuery[]>([]);

	const [isFetchingFieldOptions, setIsFetchingFieldOptions] = React.useState(false);
	const [isFetchingFieldValues, setIsFetchingFieldValues] = React.useState(false);
	const [isFetchingInterface, setIsFetchingInterface] = React.useState(false);

	const [stopWords, setStopWords] = React.useState<string[]>([]);
	const [synonymIds, setSynonymIds] = React.useState<string[]>([]);
	const [termButtonVisible, setTermButtonVisible] = React.useState(_id ? false : true); // This is used to make nice transition when adding first/remoing last
	const [initialState, setInitialState] = React.useState<{
		name: string
		collectionIds: string[]
		fields: InterfaceField[]
		stopWords: string[]
		synonymIds: string[]
		termQueries: TermQuery[]
	}>({
		name: '',
		collectionIds: [],
		fields: [], // DEFAULT_INTERFACE_FIELDS,
		stopWords: [],
		synonymIds: [],
		termQueries: []
	});
	const [isStateChanged, setIsStateChanged] = React.useState(false);
	const [anyError, setAnyError] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks
	//──────────────────────────────────────────────────────────────────────────
	const memoizedMustBeUnique = React.useCallback((v :string) => {
		if (interfaceNamesObj[v]) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	},[
		interfaceNamesObj
	]);

	const getFieldValues = React.useCallback(({
		collectionIds,
		field
	}: GetFieldValuesParams) => {
		// console.debug('getFieldValues field', field, 'collectionIds', collectionIds);
		setIsFetchingFieldValues(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query({
				operation: 'queryDocuments',
				variables: {
					aggregations: {
						list: true,
						type: 'AggregationInput',
						value: [{
							name: field,
							terms: {
								field,
								//minDocCount: 2, // No, it should be possible to boost single values
								order: '_count DESC',
								size: 100, // We only get 100 by default, then 100 per search in the dropdown
							}
						}]
					},
					collectionIds: {
						required: false,
						list: true,
						type: 'ID',
						value: collectionIds
					},
					count: {
						value: 0
					}
				},
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
				],
			}))
		})
			.then(response => response.json())
			.then(obj => {
				// console.debug('obj', obj);
				// console.debug('obj.data.queryDocuments.aggregations', obj.data.queryDocuments.aggregations);
				const {buckets} = obj.data.queryDocuments.aggregations[0];
				setFieldValueOptions(prev => {
					const deref = JSON.parse(JSON.stringify(prev)) as typeof prev;
					if (deref[field]) {
						// We already have some field value options for this field.
						for (let i = 0; i < buckets.length; i++) {
							const {docCount, key} = buckets[i];
							let foundIndex = -1;
							for (let j = 0; j < deref[field].length; j++) {
								const {value: existingKey} = deref[field][j];
								// Check all new values against old ones
								if (key === existingKey) {
									foundIndex = j;
								}
							}
							if (foundIndex === -1) {
								// Add missing values
								deref[field].push({
									text: `${key} (${docCount})`,
									value: key
								});
							} else {
								// Update docCount on existing values
								deref[field][foundIndex].text = `${key} (${docCount})`;
							}
						}
					} else {
						// We don't have any field value options for this field yet
						// So simply add all.
						deref[field] = buckets.map(
							({ docCount, key }) => ({
								text: `${key} (${docCount})`,
								value: key
							})
						);
					}
					return deref;
				});
				setIsFetchingFieldValues(false);
			});
	}, [
		servicesBaseUrl
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Init (not updates)
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		fetchCollections();
	});

	//──────────────────────────────────────────────────────────────────────────
	// Effects (init and updates)
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		const newNameError = nameVisited
			? (
				required(name)
				|| mustStartWithALowercaseLetter(name)
				|| onlyLowercaseAsciiLettersDigitsAndUnderscores(name)
				|| notDoubleUnderscore(name)
				|| (
					name === initialState.name
						? undefined
						: memoizedMustBeUnique(name)
				)
			)
			: undefined;
		if (newNameError !== nameError) {
			//console.debug('newNameError:', newNameError, ' !== nameError:', nameError);
			setNameError(newNameError);
		}
	}, [
		initialState,
		memoizedMustBeUnique,
		name,
		nameError,
		nameVisited
	]);

	React.useEffect(() => {
		const newAnyError = !!nameError;
		if (newAnyError !== anyError) {
			//console.debug('newAnyError:', newAnyError, ' !== anyError:', anyError);
			setAnyError(newAnyError);
		}
	},[
		anyError,
		nameError
	]);

	// OnMount
	React.useEffect(() => {
		if (!_id) {return;}
		const queries :IQueryBuilderOptions[] = [/*buildQueryDocumentsObject({
			collectionIds
		})*/];
		if (_id) {
			queries.push(buildGetInterfaceQueryObject({
				_id
			}));
		}
		setIsFetchingInterface(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query(queries))
		})
			.then(response => response.json())
			.then(json => {
				const data = json.data as {
					getInterface :Interface/*,
					queryDocuments :{
						aggregations :Array<{
							name :'collections'//string
							buckets :Array<{
								key :string
								docCount :number
							}>
						}>
						fieldValueCounts :Array<{
							count :number
							fieldPath :string
						}>
					}*/
				};
				//console.debug('data', data);
				if (data.getInterface && data.getInterface._name) {
					const {
						_name: initialName,
						collectionIds: initialCollectionIds,
						fields: initialFields,
						stopWords: initialStopWords,
						synonymIds: initialSynonymIds,
						termQueries: initialTermQueries = [],

					} = data.getInterface;
					setName(initialName);
					setCollectionIdsFromStorage(initialCollectionIds);
					setTermQueries(initialTermQueries);
					if (!initialTermQueries.length) {
						setTermButtonVisible(true);
					}
					for (let i = 0; i < initialTermQueries.length; i++) {
						const {
							field,
							// booleanValue,
							// doubleValue,
							// longValue,
							stringValue,
							type,
						} = initialTermQueries[i];
						if (type === VALUE_TYPE_STRING) {
							// Add stringValue in case getFieldValues doesn't (docCount less then 2)
							setFieldValueOptions(prev => {
								const deref = JSON.parse(JSON.stringify(prev)) as typeof prev;
								if (!deref[field]) {
									deref[field] = [{
										text: `${stringValue} (unknown)`, // getFieldValues will update docCount
										value: stringValue
									}]
								}
								return deref;
							});
						}
						getFieldValues({
							collectionIds: initialCollectionIds,
							field
						});
					}
					if (isSet(initialFields)) {
						if (!Array.isArray(initialFields)) {
							setFields([initialFields]);
							setFieldButtonVisible(false);
						} else if (initialFields.length) { // non-empty array
							setFields(initialFields);
							setFieldButtonVisible(false);
						} else { // initialFields is an empty array
							setFields([]/*DEFAULT_INTERFACE_FIELDS*/);
							setFieldButtonVisible(true);
						}
					} else {
						setFields([]/*DEFAULT_INTERFACE_FIELDS*/);
						setFieldButtonVisible(true);
					}
					setStopWords(initialStopWords);
					setSynonymIds(initialSynonymIds);
					setInitialState({
						name: initialName,
						collectionIds: initialCollectionIds, // This is not filtered for non-existant ids, but we don't care, they are removed on submit
						fields: initialFields,
						stopWords: initialStopWords,
						synonymIds: initialSynonymIds,
						termQueries: initialTermQueries,
					})
				}
				/*const newFieldOptions :DropdownItemProps[] = [];
				if (data.queryDocuments.fieldValueCounts && data.queryDocuments.fieldValueCounts.length) {
					for (let i = 0; i < data.queryDocuments.fieldValueCounts.length; i++) {
						const {
							count,
							fieldPath
						} = data.queryDocuments.fieldValueCounts[i];
						newFieldOptions.push({
							key: fieldPath,
							text: `${fieldPath} (${count})`,
							value: fieldPath
						});
					}
				}
				//console.debug('initialFieldOptions', newFieldOptions);
				setFieldOptions(newFieldOptions);*/
				setIsFetchingInterface(false);
			});
	}, [ // eslint-disable-line react-hooks/exhaustive-deps
		_id,
		//collectionIds, // Causes loop!
		servicesBaseUrl
	]);

	// On "any" change
	React.useEffect(() => {
		const newIsStateChanged = !fastDeepEqual({
			name,
			collectionIds: collectionIdsFromStorage,
			fields,
			stopWords,
			synonymIds
		}, initialState);
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged)
		}
	},[
		name,
		collectionIdsFromStorage,
		fields,
		initialState,
		isStateChanged,
		stopWords,
		synonymIds
	]);

	// On collectionIds change
	React.useEffect(() => {
		setIsFetchingFieldOptions(true);
		//console.debug('collectionIds', collectionIds);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query(buildQueryDocumentsObject({
				collectionIds: collectionIdsFromStorage
			})))
		})
			.then(response => response.json())
			.then(json => {
				const data = json.data as {
					queryDocuments :{
						/*aggregations :Array<{
							name :'collections'//string
							buckets :Array<{
								key :string
								docCount :number
							}>
						}>*/
						fieldValueCounts :Array<{
							count :number
							fieldPath :string
						}>
					}
				};
				//console.debug('data', data);
				const newFieldOptions :DropdownItemProps[] = [];
				if (data.queryDocuments.fieldValueCounts && data.queryDocuments.fieldValueCounts.length) {
					for (let i = 0; i < data.queryDocuments.fieldValueCounts.length; i++) {
						const {
							count,
							fieldPath
						} = data.queryDocuments.fieldValueCounts[i];
						newFieldOptions.push({
							icon: fieldPath === '_alltext' ? 'globe' : 'map marker alternate',
							key: fieldPath,
							text: `${fieldPath} (${count})`,
							value: fieldPath
						});
					}
				}
				//console.debug('filteredFieldOptions', newFieldOptions);
				setFieldOptions(newFieldOptions);
				setIsFetchingFieldOptions(false);
			});
	}, [
		collectionIdsFromStorage,
		servicesBaseUrl
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates (not init)
	//──────────────────────────────────────────────────────────────────────────
	useWhenValuesChange(() => {
		if (fetchCollectionsData) {
			const existingCollectionIds = fetchCollectionsData.queryCollections.hits.map(({_id}) => _id);
			setNonExistantCollectionIds(collectionIdsFromStorage.filter(collectionId => !existingCollectionIds.includes(collectionId)));
			const fields = Object.keys(fieldValueOptions);
			for (let index = 0; index < fields.length; index++) {
				const field = fields[index];
				// console.debug('Refreshing fieldValues for field', field, 'collectionIdsFromStorage', collectionIdsFromStorage);
				getFieldValues({
					collectionIds: collectionIdsFromStorage,
					field
				});
			}
		}
	}, [
		collectionIdsFromStorage,
		fetchCollectionsData,
	], false);

	//──────────────────────────────────────────────────────────────────────────
	function resetState() {
		const {
			name: initialName,
			collectionIds: initialCollectionIds,
			fields: initialFields,
			stopWords: initialStopWords,
			synonymIds: initialSynonymIds,
			termQueries: initialTermQueries,
		} = initialState;
		setName(initialName);
		setCollectionIdsFromStorage(initialCollectionIds);
		setTermQueries(initialTermQueries);
		if (!initialTermQueries.length) {
			setTermButtonVisible(true);
		}
		setFields(initialFields);
		setStopWords(initialStopWords);
		setSynonymIds(initialSynonymIds);
	}

	return {
		anyError,
		// boost, setBoost,
		collectionIdsFromStorage, setCollectionIdsFromStorage,
		currentState: {
			name,
			collectionIds: collectionIdsFromStorage,
			fields,
			stopWords,
			synonymIds
		},
		fieldButtonVisible, setFieldButtonVisible,
		fields, setFields,
		fieldOptions,
		fieldValueOptions, setFieldValueOptions,
		getFieldValues,
		initialState,
		isDefaultInterface: name === 'default',
		isLoading: isFetchingFieldOptions
			|| isFetchingFieldValues
			|| isFetchingInterface
			|| isFetchingCollections,
		isStateChanged,
		name,
		nameError,
		nonExistantCollectionIds,
		resetState,
		setName,
		setNameVisited,
		setStopWords,
		setSynonymIds,
		stopWords,
		synonymIds,
		termButtonVisible, setTermButtonVisible,
		termQueries, setTermQueries,
	};
}
