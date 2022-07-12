import type {
	CollectorComponentRef,
	CollectorComponentResetFunction,
	CollectorComponentValidateFunction
} from '/lib/explorer/types/index.d';


import {forceArray} from '@enonic/js-utils';
import * as React from 'react';
import {useUpdateEffect} from './utils/useUpdateEffect';


export type CollectorConfig = {
	baseUri ?:string
	excludes ?:string|Array<string>
	userAgent ?:string
}


export function useWebCrawlerState({
	collectorConfig,
	initialCollectorConfig,
	ref,
	setCollectorConfig,
	setCollectorConfigErrorCount
} :{
	collectorConfig :CollectorConfig,
	initialCollectorConfig :CollectorConfig,
	ref :CollectorComponentRef<CollectorConfig>,
	setCollectorConfig :(param :CollectorConfig|((prevCollectorConfig :CollectorConfig) => CollectorConfig)) => void
	setCollectorConfigErrorCount :(collectorConfigErrorCount :number) => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [baseUriError, setBaseUriError] = React.useState<string>(undefined);
	const [/*baseUriVisited*/, setBaseUriVisited] = React.useState(false);
	const [excludesArray, setExcludesArray] = React.useState<Array<string>>(
		collectorConfig && collectorConfig.excludes ? forceArray(collectorConfig.excludes) : undefined
	);
	const [userAgent, setUserAgent] = React.useState<string>(collectorConfig
		? (collectorConfig.userAgent || '')
		: ''
	);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks, should only depend on props, not state
	//──────────────────────────────────────────────────────────────────────────
	const validateBaseUri = React.useCallback((baseUri :string) => {
		//console.debug('in validateBaseUri');
		const newError = !baseUri ? 'Uri is required!' : undefined;
		setBaseUriError(newError); // useEffect[baseUriError] triggers setCollectorConfigErrorCount
		return !!!newError;
	},[]); // Since there are no deps, it could have been a normal function rather than a React.useCallback

	const baseUriOnChange = React.useCallback((
		_event :React.ChangeEvent<HTMLInputElement>,
		{value} : {value :string}
	) => {
		//console.debug('baseUriOnChange');
		setCollectorConfig(prevCollectorConfig => ({
			...prevCollectorConfig,
			baseUri: value
		}));
		validateBaseUri(value);
	}, [
		setCollectorConfig,
		validateBaseUri
	]);

	const baseUriOnBlur = React.useCallback(() => {
		//console.debug('baseUriOnBlur');
		setBaseUriVisited(true);
		validateBaseUri(collectorConfig
			? (collectorConfig.baseUri || '')
			: '');
	}, [
		collectorConfig,
		validateBaseUri
	]);

	const reset = React.useCallback<CollectorComponentResetFunction>(() => {
		//console.debug('in collector component reset');
		setCollectorConfig(initialCollectorConfig); // TODO This should be taken care of by the parent itself!
		setBaseUriVisited(false); // no listeners on baseUriVisited :)
		setBaseUriError(undefined); // useEffect[baseUriError] SHOULD trigger setCollectorConfigErrorCount, but DOESN'T ???

		// useEffect[excludesArray] should trigger setCollectorConfig
		setExcludesArray(initialCollectorConfig && initialCollectorConfig.excludes ? forceArray(initialCollectorConfig.excludes) : undefined);

		// useEffect[userAgent] should trigger setCollectorConfig
		setUserAgent(initialCollectorConfig
			? (initialCollectorConfig.userAgent || '')
			: ''
		);
		setCollectorConfigErrorCount(0); // useEffect[baseUriError] SHOULD trigger setCollectorConfigErrorCount, but DOESN'T ???
	}, [
		initialCollectorConfig, // never changes
		setCollectorConfig,
		setCollectorConfigErrorCount
	]);

	const validate = React.useCallback<CollectorComponentValidateFunction<CollectorConfig>>(({baseUri} :{baseUri :string}) => {
		//console.debug('in validateCollectorConfig');
		const newCollectorConfigErrorCount = validateBaseUri(baseUri) ? 0 : 1;
		//setCollectorConfigErrorCount(newCollectorConfigErrorCount); // useEffect on baseUriError triggers setCollectorConfigErrorCount
		return !!!newCollectorConfigErrorCount;
	}, [
		//setCollectorConfigErrorCount,
		validateBaseUri
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Make it possible for parent to call these functions
	//──────────────────────────────────────────────────────────────────────────
	React.useImperativeHandle(ref, () => ({
		reset,
		validate
	}));

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	/*React.useEffect(() => {
		console.debug('Collector component init');
	},[]);*/

	//──────────────────────────────────────────────────────────────────────────
	// Updates (changes, not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		//console.debug('Collector component baseUriError changed', baseUriError);
		setCollectorConfigErrorCount(baseUriError ? 1 : 0);
	}, [
		baseUriError
	]);

	useUpdateEffect(() => {
		//console.debug('any change calling setCollectorConfig()');
		setCollectorConfig(prevCollectorConfig => ({
			...prevCollectorConfig,
			excludes: excludesArray,
			userAgent
		}));
	},[
		excludesArray,
		setCollectorConfig,
		userAgent
	]);

	return {
		baseUriOnBlur,
		baseUriOnChange,
		baseUriError,
		excludesArray,
		setExcludesArray,
		setUserAgent,
		userAgent
	};
}
