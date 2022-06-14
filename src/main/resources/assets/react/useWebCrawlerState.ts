import type {AnyObject} from '/lib/explorer/types/index.d';


import {forceArray} from '@enonic/js-utils';
import * as React from 'react';
import {useUpdateEffect} from './utils/useUpdateEffect';


type CollectorConfig = {
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
	ref :React.ForwardedRef<unknown>,
	setCollectorConfig :(collectorConfig :CollectorConfig) => void
	setCollectorConfigErrorCount :(collectorConfigErrorCount :number) => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [baseUri, setBaseUri] = React.useState<string>(collectorConfig
		? (collectorConfig.baseUri || '')
		: ''
	);
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
		setBaseUri(value);
		validateBaseUri(value);
	}, [
		validateBaseUri
	]);

	const baseUriOnBlur = React.useCallback((baseUri :string) => {
		//console.debug('baseUriOnBlur');
		setBaseUriVisited(true);
		validateBaseUri(baseUri);
	}, [validateBaseUri]);

	const reset = React.useCallback(() => {
		//console.debug('in collector component reset');
		setBaseUri(initialCollectorConfig
			? (initialCollectorConfig.baseUri || '')
			: ''); // useEffect[baseUri] should trigger setCollectorConfig
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
		setCollectorConfigErrorCount
	]);

	const validate = React.useCallback<(collectorConfig :AnyObject) => boolean>(({baseUri} :{baseUri :string}) => {
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
		setCollectorConfig({
			baseUri,
			excludes: excludesArray,
			userAgent
		});
	},[
		baseUri,
		excludesArray,
		setCollectorConfig,
		userAgent
	]);

	return {
		baseUri,
		baseUriOnBlur,
		baseUriOnChange,
		baseUriError,
		excludesArray,
		setExcludesArray,
		setUserAgent,
		userAgent
	};
}
