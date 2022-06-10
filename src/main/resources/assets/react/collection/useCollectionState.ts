import type {QueryCollectionsHits} from './index.d';
import type {AnyObject, CollectionFormValues} from '/lib/explorer/types/index.d';


import fastDeepEqual from 'fast-deep-equal/react';
import * as React from 'react';


export function useCollectionState({
	collections,
	initialValues
} :{
	collections :QueryCollectionsHits
	initialValues :CollectionFormValues
}) {
	if (initialValues.collector && initialValues.collector.configJson) {
		initialValues.collector.config = JSON.parse(initialValues.collector.configJson);
	}

	const [collectorConfig, setCollectorConfig] = React.useState<AnyObject>(initialValues.collector ? initialValues.collector.config : undefined);
	const [collectorName, setCollectorName] = React.useState<string>(initialValues.collector ? initialValues.collector.name : undefined);
	const [cronArray, setCronArray] = React.useState(initialValues.cron);
	const [documentTypeId, setDocumentTypeId] = React.useState<string>(initialValues.documentTypeId);
	const [doCollect, setDoCollect] = React.useState(initialValues.doCollect);
	const [language, setLanguage] = React.useState(initialValues.language);
	const [name, setName] = React.useState(initialValues._name);

	const [isStateChanged, setIsStateChanged] = React.useState(false);
	const [nameError, setNameError] = React.useState<false|string>(false);

	React.useEffect(() => {
		let newIsStateChanged = false;
		if (
			name !== initialValues._name
			|| language !== initialValues.language
			|| collectorName !== (initialValues.collector ? initialValues.collector.name : undefined)
			|| documentTypeId !== initialValues.documentTypeId
			|| !fastDeepEqual(collectorConfig, (initialValues.collector ? initialValues.collector.config : undefined))
			|| doCollect !== initialValues.doCollect
			|| !fastDeepEqual(cronArray,initialValues.cron)
		) {
			newIsStateChanged = true;
		}
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged);
		}
	}, [
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		initialValues,
		isStateChanged,
		language,
		name
	]);

	React.useEffect(() => {
		if (!collectorName) {
			setDocumentTypeId(undefined);
		}
	}, [collectorName]);

	function resetState() {
		setCollectorConfig(initialValues.collector ? initialValues.collector.config : undefined);
		setCollectorName(initialValues.collector ? initialValues.collector.name : undefined);
		setCronArray(initialValues.cron);
		setDocumentTypeId(initialValues.documentTypeId);
		setDoCollect(initialValues.doCollect);
		setLanguage(initialValues.language);
		setName(initialValues._name);
		setNameError(false);
	}

	return {
		collectionNames: collections.map(({_name}) => _name),
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		isStateChanged,
		language,
		name,
		nameError,
		resetState,
		setCollectorConfig,
		setCollectorName,
		setCronArray,
		setDoCollect,
		setDocumentTypeId,
		setLanguage,
		setName,
		setNameError
	}; // return
} // useCollectionState
