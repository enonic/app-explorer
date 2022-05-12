import type {
	QueryApiKeysHits,
	QueryCollectionsGraph,
	QueryInterfacesGraph
} from './index.d';


import * as React from 'react';


const GQL = `{
	queryCollections {
		hits {
			_name
		}
	}
	queryInterfaces {
		hits {
			_name
		}
	}
}`;

export function useNewOrEditApiKeyState({
	apiKeys,
	servicesBaseUrl
}: {
	apiKeys :QueryApiKeysHits
	servicesBaseUrl :string
}) {
	const [name, setName] = React.useState('');
	const [nameError, setNameError] = React.useState<false|string>(false);
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState<QueryCollectionsGraph>({
		hits: []
	});
	const [queryInterfacesGraph, setQueryInterfacesGraph] = React.useState<QueryInterfacesGraph>({
		hits: []
	});

	const memoizedUpdateState = React.useCallback(() => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryInterfacesGraph(res.data.queryInterfaces);
				}
			});
	},[
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedUpdateState(), [
		memoizedUpdateState
	]); // Only once

	return {
		apiKeyNames: apiKeys.map(({_name}) => _name),
		collectionOptions: queryCollectionsGraph.hits.map(({_name: key}) => ({
			key,
			text: key,
			value: key
		})),
		interfaceOptions: queryInterfacesGraph.hits.map(({_name: key}) => ({
			key,
			text: key,
			value: key
		})),
		name,
		nameError,
		setName,
		setNameError
	};
}
