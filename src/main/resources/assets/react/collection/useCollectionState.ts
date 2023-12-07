import type {QueryCollectionsHits} from './index.d';
import type {
	AnyObject,
	CollectionFormValues,
	CollectorComponentImperativeHandle
} from '@enonic-types/lib-explorer';


import {isFunction} from '@enonic/js-utils';
import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder-ts';
import * as React from 'react';
import {GQL_MUTATION_CREATE_COLLECTION} from '../../../services/graphQL/collection/mutationCreateCollection';
import {GQL_MUTATION_UPDATE_COLLECTION} from '../../../services/graphQL/collection/mutationUpdateCollection';
import {repoIdValidator} from '../utils/repoIdValidator';
import {useUpdateEffect} from '../utils/useUpdateEffect';


function collectionArrayToNamesObj(collections :QueryCollectionsHits) {
	return Object.fromEntries(
		collections.map(({_name}) => ([_name, true]))
	) as {[collectionName :string] :true};
}

function getCollectorConfigFromInitiaValues(initialValues :CollectionFormValues) :AnyObject|undefined {
	if (!initialValues.collector) {
		return undefined;
	}

	if (initialValues.collector.configJson) {
		return JSON.parse(initialValues.collector.configJson);
	}

	if (initialValues.collector.config) {
		return initialValues.collector.config;
	}

	return {};
}

function getCollectorNameFromInitiaValues(initialValues :CollectionFormValues) :string|undefined {
	return (initialValues.collector && initialValues.collector.name)
		? initialValues.collector.name
		: initialValues._id
			? '_none'
			: '';
}

function getDocumentTypeIdFromInitiaValues(initialValues :CollectionFormValues) :string|undefined {
	return initialValues.documentTypeId
		? initialValues.documentTypeId
		: initialValues._id
			? '_none'
			: undefined;
}


export function useCollectionState({
	collections,
	doClose,
	initialValues,
	servicesBaseUrl
} :{
	collections :QueryCollectionsHits
	doClose :() => void
	initialValues :CollectionFormValues
	servicesBaseUrl :string
}) {
	const collectorComponentRef = React.useRef<CollectorComponentImperativeHandle>(null);

	//──────────────────────────────────────────────────────────────────────────
	// "Derived" state
	//──────────────────────────────────────────────────────────────────────────
	const [collectorName, setCollectorName] = React.useState<string>(getCollectorNameFromInitiaValues(initialValues));
	const [cronArray, setCronArray] = React.useState(initialValues.cron);
	const [documentTypeId, setDocumentTypeId] = React.useState<string>(getDocumentTypeIdFromInitiaValues(initialValues));
	const [doCollect, setDoCollect] = React.useState(initialValues.doCollect);
	const [language, setLanguage] = React.useState(initialValues.language);
	const [managedDocumentTypes, setManagedDocumentTypes] = React.useState<string[]|null>(null);
	const [name, setName] = React.useState(initialValues._name);

	//──────────────────────────────────────────────────────────────────────────
	// Internal state
	//──────────────────────────────────────────────────────────────────────────
	const [isStateChanged, setIsStateChanged] = React.useState(false);
	const [nameError, setNameError] = React.useState<false|string>(false);
	const [/*nameVisited*/, setNameVisited] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [errorCount, setErrorCount] = React.useState(0);

	//──────────────────────────────────────────────────────────────────────────
	// State passed to and sometimes affected by Collector Component
	//──────────────────────────────────────────────────────────────────────────
	const [initialCollectorConfig] = React.useState(getCollectorConfigFromInitiaValues(initialValues));
	const [collectorConfig, setCollectorConfig] = React.useState(getCollectorConfigFromInitiaValues(initialValues));
	const [collectorConfigErrorCount, setCollectorConfigErrorCount] = React.useState(0);
	//console.debug('collectorConfig', collectorConfig);

	//──────────────────────────────────────────────────────────────────────────
	// Debug
	//──────────────────────────────────────────────────────────────────────────
	/*
	useUpdateEffect(() => {console.debug('collectorConfig changed', collectorConfig);}, [collectorConfig]);
	useUpdateEffect(() => {console.debug('collectorName changed', collectorName);}, [collectorName]);
	useUpdateEffect(() => {console.debug('cronArray changed', cronArray);}, [cronArray]);
	useUpdateEffect(() => {console.debug('doCollect changed', doCollect);}, [doCollect]);
	useUpdateEffect(() => {console.debug('documentTypeId changed', documentTypeId);}, [documentTypeId]);
	useUpdateEffect(() => {console.debug('language changed', language);}, [language]);
	useUpdateEffect(() => {console.debug('name changed', name);}, [name]);

	// TODO: Why does this change!!! Seems to happen if props deconstruction contain default values.
	useUpdateEffect(() => {console.debug('initialValues changed', initialValues);}, [initialValues]);
	*/

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks, should only depend on props, not state
	//──────────────────────────────────────────────────────────────────────────
	const validateName = React.useCallback((collectionName :string) => {
		const collectionNamesObj = collectionArrayToNamesObj(collections);
		const newNameError = !collectionName
			? 'Name is required!'
			: (
				collectionName !== initialValues._name && collectionNamesObj[collectionName]
			)
				? `The name "${collectionName}" is already in use, please input another name."`
				: repoIdValidator(collectionName);
		setNameError(newNameError);
		return !(!!newNameError); // negate boolean casted string
	}, [
		collections,
		initialValues._name
	]);

	const nameOnBlur = React.useCallback((collectionName :string) => {
		setNameVisited(true);
		validateName(collectionName);
	}, [validateName]);

	const nameOnChange = React.useCallback((_event :React.ChangeEvent<HTMLInputElement>,{value: newName}) => {
		setName(newName);
		validateName(newName);
	}, [validateName]);

	const validateForm = React.useCallback(({
		collectionName,
		collectorConfig
	} :{
		collectionName :string
		collectorConfig :AnyObject
	}) => {
		//console.debug('validateForm collectionName:', collectionName, ' collectorConfig:', collectorConfig);

		const valid = validateName(collectionName);
		//console.debug('validateForm valid:', valid);

		let collectorConfigValid = true;
		if (collectorComponentRef && collectorComponentRef.current && isFunction(collectorComponentRef.current.validate)) {
			//console.debug('calling validate collectorConfig:', collectorConfig);
			collectorConfigValid = collectorComponentRef.current.validate(collectorConfig);
		}

		return valid && collectorConfigValid;
	}, [
		validateName
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Init and updates
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		if (collectorName) {
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type': 'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'getManagedDocumentTypes',
					variables: {
						collectorId: {
							required: true,
							type: 'ID',
							value: collectorName
						}
					}/*,
					fields: []*/
				}))
			})
				.then(response => response.json())
				.then(json => {
					// console.debug('json', json)
					const {
						data: {
							getManagedDocumentTypes
						}
					} = json;
					// console.debug('setting managedDocumentTypes to', getManagedDocumentTypes);
					setManagedDocumentTypes(getManagedDocumentTypes);
				});
		} else {
			// console.debug('setting managedDocumentTypes to null');
			setManagedDocumentTypes(null);
		}
	},[
		collectorName,
		servicesBaseUrl
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates (changes, not init)
	//──────────────────────────────────────────────────────────────────────────
	function checkIsChanged() {
		return name !== initialValues._name
			|| language !== initialValues.language
			|| collectorName !== (initialValues.collector ? initialValues.collector.name : undefined)
			|| documentTypeId !== initialValues.documentTypeId
			|| !fastDeepEqual(collectorConfig, (initialValues.collector ? initialValues.collector.config : undefined))
			|| doCollect !== initialValues.doCollect
			|| !fastDeepEqual(cronArray,initialValues.cron);
	}

	useUpdateEffect(() => {
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		language,
		name
	]);

	useUpdateEffect(() => {
		if (!collectorName) {
			setDocumentTypeId(undefined);
		}
	}, [collectorName]);

	useUpdateEffect(() => {
		//console.debug('collectorConfigErrorCount:', collectorConfigErrorCount, ' or nameError:', nameError, ' changed');
		const newErrorCount = (nameError ? 1 : 0) + collectorConfigErrorCount;
		//if (newErrorCount !== errorCount) {
		setErrorCount(newErrorCount);
		//}
	},[
		collectorConfigErrorCount,
		//errorCount,
		nameError
	]);

	function resetState() {
		//console.debug('resetState');

		setCollectorConfig(getCollectorConfigFromInitiaValues(initialValues));
		setCollectorConfigErrorCount(0); // This will trigger setErrorCount
		//setErrorCount(0); // This will be called by useEffect on [collectorConfigErrorCount, nameError]

		if (
			collectorComponentRef
			&& collectorComponentRef.current
			&& isFunction(collectorComponentRef.current.afterReset)
		) {
			collectorComponentRef.current.afterReset();
		}

		setCollectorName(getCollectorNameFromInitiaValues(initialValues));
		setCronArray(initialValues.cron);
		setDocumentTypeId(getDocumentTypeIdFromInitiaValues(initialValues));
		setDoCollect(initialValues.doCollect);
		setLanguage(initialValues.language);

		// These might have race conditions?
		setNameVisited(false); // There are no listeners on nameVisited :)
		setName(initialValues._name); // This will trigger isStateChanged, but no validation
		setNameError(false); // This will trigger setErrorCount

		//setIsStateChanged(false); // This will be called by useEffect on [anyChange]
	}

	function onSubmit() {
		setLoading(true);
		//console.debug('SubmitButton onClick, collectorConfig:', collectorConfig);
		if (!validateForm({
			collectionName: name,
			collectorConfig
		})) {
			setLoading(false);
			return;
		}
		const {_id} = initialValues;
		//console.debug('submit _id', _id);
		const variables :{
			_id ?:string
			_name ?:string
			collector ?:{
				configJson ?:string
				name ?:string
			}
			cron :Array<{
				month :string
				dayOfMonth :string
				dayOfWeek :string
				minute :string
				hour :string
			}>
			doCollect :boolean
			documentTypeId ?:string
			language :string
		} = {
			cron: cronArray,
			doCollect,
			language
		};
		if (
			documentTypeId
			//&& !documentTypeId.startsWith('_') // Handled in the backend (_none and _new doesn't mean the same...)
		) {
			variables.documentTypeId = documentTypeId;
		}
		if (collectorName && collectorName !== '_none') {
			variables.collector = {
				name: collectorName
			};
			if (collectorConfig) {
				variables.collector.configJson = JSON.stringify(collectorConfig);
			}
		}
		if (_id) {
			variables._id = _id; // Update
		} else {
			variables._name = name; // Create
		}
		//console.debug('submit variables', variables);

		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { // HTTP/2 uses lowercase header keys
				'content-type':	'application/json'
			},
			body: JSON.stringify({
				query: _id ? GQL_MUTATION_UPDATE_COLLECTION : GQL_MUTATION_CREATE_COLLECTION,
				variables
			})
		}).then(response => {
			if (response.status === 200) { doClose(); }
			setLoading(false);
		});
	} // onSubmit

	return {
		collectorComponentRef,
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		errorCount,
		initialCollectorConfig,
		isStateChanged,
		language,
		loading,
		managedDocumentTypes,
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setCollectorConfig,
		setCollectorConfigErrorCount,
		setCollectorName,
		setCronArray,
		setDoCollect,
		setDocumentTypeId,
		setLanguage,
		setName
	}; // return
} // useCollectionState
