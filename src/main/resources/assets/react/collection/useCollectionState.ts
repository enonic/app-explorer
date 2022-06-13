import type {QueryCollectionsHits} from './index.d';
import type {AnyObject, CollectionFormValues} from '/lib/explorer/types/index.d';


import {isFunction} from '@enonic/js-utils';
import fastDeepEqual from 'fast-deep-equal/react';
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


function collectorConfigFromInitiaValues(initialValues :CollectionFormValues) :AnyObject|undefined {
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
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const collectorComponentRef = React.useRef<{
		reset :() => void
		validate :(collectorConfig :AnyObject) => boolean
			}>(null);
	const [collectorConfig, setCollectorConfig] = React.useState(collectorConfigFromInitiaValues(initialValues));

	const [collectorName, setCollectorName] = React.useState<string>(initialValues.collector ? initialValues.collector.name : undefined);
	const [cronArray, setCronArray] = React.useState(initialValues.cron);
	const [documentTypeId, setDocumentTypeId] = React.useState<string>(initialValues.documentTypeId);
	const [doCollect, setDoCollect] = React.useState(initialValues.doCollect);
	const [language, setLanguage] = React.useState(initialValues.language);
	const [name, setName] = React.useState(initialValues._name);

	const [isStateChanged, setIsStateChanged] = React.useState(false);
	const [nameError, setNameError] = React.useState<false|string>(false);
	const [/*nameVisited*/, setNameVisited] = React.useState(false);
	const [collectorConfigErrorCount, setCollectorConfigErrorCount] = React.useState(0);
	const [errorCount, setErrorCount] = React.useState(0);

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
		console.debug('validateForm collectionName:', collectionName, ' collectorConfig:', collectorConfig);

		const valid = validateName(collectionName);
		console.debug('validateForm valid:', valid);

		let collectorConfigValid = true;
		if (collectorComponentRef && collectorComponentRef.current && isFunction(collectorComponentRef.current.validate)) {
			console.debug('calling validate collectorConfig:', collectorConfig);
			collectorConfigValid = collectorComponentRef.current.validate(collectorConfig);
		}

		return valid && collectorConfigValid;
	}, [
		validateName
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
		console.debug('collectorConfig changed', collectorConfig);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [collectorConfig]);

	useUpdateEffect(() => {
		console.debug('collectorName changed', collectorName);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [collectorName]);

	useUpdateEffect(() => {
		console.debug('cronArray changed', cronArray);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [cronArray]);

	useUpdateEffect(() => {
		console.debug('doCollect changed', doCollect);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [doCollect]);

	useUpdateEffect(() => {
		console.debug('documentTypeId changed', documentTypeId);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [documentTypeId]);

	/*useUpdateEffect(() => {
		console.debug('initialValues changed', initialValues);
	}, [
		initialValues // TODO: Why does this change!!! Seems to happen if props deconstruction contain default values.
	]);*/

	useUpdateEffect(() => {
		console.debug('language changed', language);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [language]);

	useUpdateEffect(() => {
		console.debug('name changed', name);
		const newIsStateChanged = checkIsChanged();
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [name]);

	useUpdateEffect(() => {
		console.debug('collectorName changed', collectorName);
		if (!collectorName) {
			setDocumentTypeId(undefined);
		}
	}, [collectorName]);

	useUpdateEffect(() => {
		console.debug('collectorConfigErrorCount:', collectorConfigErrorCount, ' or nameError:', nameError, ' changed');
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
		console.debug('resetState');

		if (collectorComponentRef && collectorComponentRef.current && isFunction(collectorComponentRef.current.reset)) {
			collectorComponentRef.current.reset();
		} else {
			setCollectorConfig(collectorConfigFromInitiaValues(initialValues));
			setCollectorConfigErrorCount(0); // This will trigger setErrorCount
			//setErrorCount(0); // This will be called by useEffect on [collectorConfigErrorCount, nameError]
		}

		setCollectorName(initialValues.collector ? initialValues.collector.name : undefined);
		setCronArray(initialValues.cron);
		setDocumentTypeId(initialValues.documentTypeId);
		setDoCollect(initialValues.doCollect);
		setLanguage(initialValues.language);

		// These might have race conditions?
		setNameVisited(false); // There are no listeners on nameVisited :)
		setName(initialValues._name); // This will trigger isStateChanged, but no validation
		setNameError(false); // This will trigger setErrorCount

		//setIsStateChanged(false); // This will be called by useEffect on [anyChange]
	}

	function onSubmit() {
		console.debug('SubmitButton onClick, collectorConfig:', collectorConfig);
		if (!validateForm({
			collectionName: name,
			collectorConfig
		})) {
			return;
		}
		const {_id} = initialValues;
		//console.debug('submit _id', _id);
		const variables :{
			_id ?:string
			_name :string
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
			_name: name,
			cron: cronArray,
			doCollect,
			language
		};
		if (documentTypeId && !documentTypeId.startsWith('_')) {
			variables.documentTypeId = documentTypeId;
		}
		if (collectorName || collectorConfig) {
			variables.collector = {};
			if (collectorName) {
				variables.collector.name = collectorName;
			}
			if (collectorConfig) {
				variables.collector.configJson = JSON.stringify(collectorConfig);
			}
		}
		if (_id) {
			variables._id = _id;
		}
		//console.debug('submit variables', variables);

		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: _id ? GQL_MUTATION_UPDATE_COLLECTION : GQL_MUTATION_CREATE_COLLECTION,
				variables
			})
		}).then(response => {
			if (response.status === 200) { doClose(); }
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
		isStateChanged,
		language,
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
		setName,
		setNameVisited
	}; // return
} // useCollectionState
