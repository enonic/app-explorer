import type {
	Interface,
	InterfaceField
} from '/lib/explorer/types/Interface.d';
import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions.d';
import type {DropdownItemProps} from 'semantic-ui-react/index.d';
import type {InterfaceNamesObj} from './index.d';


import {isSet} from '@enonic/js-utils';
import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import {DEFAULT_INTERFACE_FIELDS} from '../constants';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';


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
			'synonymIds'
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
	collectionIds ?:Array<string>
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
						field: 'collectionName'
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
	const [name, setName] = React.useState('');
	const [nameError, setNameError] = React.useState<string>();
	const [nameVisited, setNameVisited] = React.useState(false);
	const [collectionIds, setCollectionIds] = React.useState<Array<string>>([]);
	const [fieldOptions, setFieldOptions] = React.useState<Array<DropdownItemProps>>([]);
	const [fields, setFields] = React.useState<Array<InterfaceField>>(DEFAULT_INTERFACE_FIELDS);
	const [isLoading, setIsLoading] = React.useState(true);
	const [stopWords, setStopWords] = React.useState<Array<string>>([]);
	const [synonymIds, setSynonymIds] = React.useState<Array<string>>([]);
	const [initialState, setInitialState] = React.useState<{
		name :string
		collectionIds :Array<string>
		fields :Array<InterfaceField>
		stopWords :Array<string>
		synonymIds :Array<string>
	}>({
		name: '',
		collectionIds: [],
		fields: DEFAULT_INTERFACE_FIELDS,
		stopWords: [],
		synonymIds: []
	});
	const [isStateChanged, setIsStateChanged] = React.useState(false);

	const memoizedMustBeUnique = React.useCallback((v :string) => {
		if (interfaceNamesObj[v]) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	},[
		interfaceNamesObj
	]);
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

	const [anyError, setAnyError] = React.useState(false);
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
		const queries :Array<IQueryBuilderOptions> = [/*buildQueryDocumentsObject({
			collectionIds
		})*/];
		if (_id) {
			queries.push(buildGetInterfaceQueryObject({
				_id
			}));
		}
		setIsLoading(true);
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
						synonymIds: initialSynonymIds
					} = data.getInterface;
					setName(initialName);
					setCollectionIds(initialCollectionIds);
					if (isSet(initialFields)) {
						if (!Array.isArray(initialFields)) {
							setFields([initialFields]);
						} else if (initialFields.length) { // non-empty array
							setFields(initialFields);
						} else { // initialFields is an empty array
							setFields(DEFAULT_INTERFACE_FIELDS);
						}
					} else {
						setFields(DEFAULT_INTERFACE_FIELDS);
					}
					setStopWords(initialStopWords);
					setSynonymIds(initialSynonymIds);
					setInitialState({
						name: initialName,
						collectionIds: initialCollectionIds,
						fields: initialFields,
						stopWords: initialStopWords,
						synonymIds: initialSynonymIds
					})
				}
				/*const newFieldOptions :Array<DropdownItemProps> = [];
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
				setIsLoading(false);
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
			collectionIds,
			fields,
			stopWords,
			synonymIds
		}, initialState);
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged)
		}
	},[
		name,
		collectionIds,
		fields,
		initialState,
		isStateChanged,
		stopWords,
		synonymIds
	]);

	// On collectionIds change
	React.useEffect(() => {
		setIsLoading(true);
		//console.debug('collectionIds', collectionIds);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query(buildQueryDocumentsObject({
				collectionIds
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
				const newFieldOptions :Array<DropdownItemProps> = [];
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
				setIsLoading(false);
			});
	}, [
		collectionIds,
		servicesBaseUrl
	]);

	function resetState() {
		const {
			name: initialName,
			collectionIds: initialCollectionIds,
			fields: initialFields,
			stopWords: initialStopWords,
			synonymIds: initialSynonymIds
		} = initialState;
		setName(initialName);
		setCollectionIds(initialCollectionIds);
		setFields(initialFields);
		setStopWords(initialStopWords);
		setSynonymIds(initialSynonymIds);
	}

	return {
		anyError,
		collectionIds,
		currentState: {
			name,
			collectionIds,
			fields,
			stopWords,
			synonymIds
		},
		fields,
		fieldOptions,
		initialState,
		isDefaultInterface: name === 'default',
		isLoading,
		isStateChanged,
		name,
		nameError,
		resetState,
		setCollectionIds,
		setFields,
		setName,
		setNameVisited,
		setStopWords,
		setSynonymIds,
		stopWords,
		synonymIds
	};
}
