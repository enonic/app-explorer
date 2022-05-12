import type {QueryApiKeysGraph} from './index.d';


import * as React from 'react';

//@ts-ignore
import {useInterval} from '../utils/useInterval';


const GQL = `{
	queryApiKeys {
		hits {
			_id
			_name
			collections
			interfaces
		}
	}
}`;


export function useApiKeysState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const [queryApiKeysGraph, setQueryApiKeysGraph] = React.useState<QueryApiKeysGraph>({
		hits: []
	});

	const [boolPoll, setBoolPoll] = React.useState(true);

	const [showCollections, setShowCollections] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);

	const memoizedFetchApiKeys = React.useCallback(() => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryApiKeysGraph(res.data.queryApiKeys);
				}
			});
	},[
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchApiKeys(), [
		memoizedFetchApiKeys
	]); // Only once

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			memoizedFetchApiKeys();
		}
	}, 2500);


	return {
		apiKeys: queryApiKeysGraph.hits,
		memoizedFetchApiKeys,
		setBoolPoll,
		setShowCollections,
		setShowInterfaces,
		showCollections,
		showInterfaces
	};
}
