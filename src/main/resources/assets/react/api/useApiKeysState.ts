import type {QueryApiKeysGraph} from './index.d';


import * as React from 'react';


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
	const [isLoading, setIsLoading] = React.useState(false);

	const memoizedFetchApiKeys = React.useCallback(() => {
		setIsLoading(true);
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
				setIsLoading(false);
			});
	},[
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchApiKeys(), [
		memoizedFetchApiKeys
	]); // Only once

	return {
		apiKeys: queryApiKeysGraph.hits,
		isLoading,
		memoizedFetchApiKeys
	};
}
