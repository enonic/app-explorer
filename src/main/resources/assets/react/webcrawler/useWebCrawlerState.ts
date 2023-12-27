import type {
	CollectorComponentRef,
	CollectorComponentAfterResetFunction,
	CollectorComponentValidateFunction
} from '@enonic-types/lib-explorer';
import type {
	CollectorConfig,
	HttpRequestHeader
} from '/tasks/webcrawl/webcrawl.d';


import {
	forceArray,
	isSet,
} from '@enonic/js-utils';
import * as React from 'react';
import {useUpdateEffect} from '../utils/useUpdateEffect';


export function useWebCrawlerState({
	collectorConfig,
	ref,
	setCollectorConfig,
	setCollectorConfigErrorCount
}: {
	collectorConfig: CollectorConfig
	ref: CollectorComponentRef<CollectorConfig>
	setCollectorConfig: (param: CollectorConfig|((prevCollectorConfig: CollectorConfig) => CollectorConfig)) => void
	setCollectorConfigErrorCount: (collectorConfigErrorCount: number) => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// Avoiding derived state, by simply "symlinking"
	//──────────────────────────────────────────────────────────────────────────
	const baseUri = collectorConfig
		? (collectorConfig.baseUri || '')
		: '';

	const excludesArray = collectorConfig && collectorConfig.excludes ? forceArray(collectorConfig.excludes) : undefined; // Avoid derived state, so don't wrap with useState!
	//console.debug('excludesArray', excludesArray);

	const setExcludesArray = (newExcludesArray: Array<string>) => setCollectorConfig(prevCollectorConfig => {
		//console.debug('setExcludesArray newExcludesArray', newExcludesArray);
		return {
			...prevCollectorConfig,
			excludes: newExcludesArray
		};
	});

	const keepHtml = collectorConfig && isSet(collectorConfig.keepHtml)
		? collectorConfig.keepHtml
		: false;
	const setKeepHtml = (newKeepHtml: boolean) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			keepHtml: newKeepHtml
		};
	});

	const maxPages = collectorConfig
		? (collectorConfig.maxPages || 1000)
		: 1000;

	const setMaxPages = (newMaxPages: number) => {
		if (newMaxPages < 1) newMaxPages = 1;
		if (newMaxPages > 100000) newMaxPages = 100000;
		setCollectorConfig(prevCollectorConfig => {
			return {
				...prevCollectorConfig,
				maxPages: newMaxPages
			};
		});
	};

	const userAgent = collectorConfig
		? (collectorConfig.userAgent || '')
		: '';

	const setUserAgent = (newUserAgent: string) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			userAgent: newUserAgent
		};
	});

	const httpRequestHeaders = collectorConfig && collectorConfig.httpRequestHeaders ? forceArray(collectorConfig.httpRequestHeaders) : [];
	// console.debug('httpRequestHeaders', httpRequestHeaders);

	const setHttpRequestHeaders = (newHttpRequestHeaders: HttpRequestHeader[]) => setCollectorConfig(prevCollectorConfig => {
		// console.debug('setHttpRequestHeaders newHttpRequestHeaders', newHttpRequestHeaders);
		return {
			...prevCollectorConfig,
			httpRequestHeaders: newHttpRequestHeaders
		};
	});

	const browserlessUrl = collectorConfig && typeof collectorConfig.browserlessUrl === 'string' ? collectorConfig.browserlessUrl : undefined;
	const setBrowserlessUrl = (newBrowserlessUrl: string) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			browserlessUrl: newBrowserlessUrl
		};
	});

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [baseUriError, setBaseUriError] = React.useState<string>(undefined);
	const [/*baseUriVisited*/, setBaseUriVisited] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks, should only depend on props, not state
	//──────────────────────────────────────────────────────────────────────────
	const validateBaseUri = React.useCallback((baseUri: string) => {
		//console.debug('in validateBaseUri');
		const newError = !baseUri ? 'Uri is required!' : undefined;
		setBaseUriError(newError); // useEffect[baseUriError] triggers setCollectorConfigErrorCount
		return !newError;
	},[]); // Since there are no deps, it could have been a normal function rather than a React.useCallback

	const baseUriOnChange = React.useCallback((
		_event: React.ChangeEvent<HTMLInputElement>,
		{value}:  {value: string}
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

	const afterReset: CollectorComponentAfterResetFunction = () => {
		setBaseUriVisited(false); // no listeners on baseUriVisited :)
		setBaseUriError(undefined); // useEffect[baseUriError] SHOULD trigger setCollectorConfigErrorCount, but DOESN'T ???
	};

	const validate = React.useCallback<CollectorComponentValidateFunction<CollectorConfig>>(({baseUri}: CollectorConfig) => {
		//console.debug('in validateCollectorConfig');
		const newCollectorConfigErrorCount = validateBaseUri(baseUri) ? 0 : 1;
		return !newCollectorConfigErrorCount;
	}, [
		validateBaseUri
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Make it possible for parent to call these functions
	//──────────────────────────────────────────────────────────────────────────
	React.useImperativeHandle(ref, () => ({
		afterReset,
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
		let newErrorCount = httpRequestHeaders.filter(({error}) => error).length;
		if (baseUriError) newErrorCount++;
		// console.debug('newErrorCount', newErrorCount);
		setCollectorConfigErrorCount(newErrorCount);
	}, [
		baseUriError,
		httpRequestHeaders
	]);

	return {
		baseUri,
		baseUriOnBlur,
		baseUriOnChange,
		baseUriError,
		browserlessUrl, setBrowserlessUrl,
		excludesArray,
		httpRequestHeaders, setHttpRequestHeaders,
		keepHtml,
		maxPages, setMaxPages,
		setExcludesArray,
		setKeepHtml,
		setUserAgent,
		userAgent
	};
}
