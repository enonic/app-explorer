import type {
	QueryApiKeysHits,
	QueryCollectionsGraph,
	QueryInterfacesGraph
} from './index.d';


import fastDeepEqual from 'fast-deep-equal/react';
import * as React from 'react';
import {makeKey} from './makeKey';


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
	// Required
	apiKeys,
	servicesBaseUrl,
	// Optional
	_name = '',
	collections = [],
	interfaces = []
}: {
	apiKeys :QueryApiKeysHits
	_name ?:string
	collections ?:Array<string>
	interfaces ?:Array<string>
	servicesBaseUrl :string
}) {
	const [name, setName] = React.useState(_name);
	const [key, setKey] = React.useState(_name ? '' : makeKey());
	const [collectionNames, setCollectionNames] = React.useState<Array<string>>(collections);
	const [interfaceNames, setInterfaceNames] = React.useState<Array<string>>(interfaces);
	const [initialState/*, setInitialState*/] = React.useState({
		name,
		key,
		collectionNames,
		interfaceNames
	});
	const [isStateChanged, setIsStateChanged] = React.useState(false);

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
			headers: { // HTTP/2 uses lowercase header keys
				'content-type': 'application/json'
			},
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

	// On "any" change
	React.useEffect(() => {
		const newIsStateChanged = !fastDeepEqual({
			name,
			key,
			collectionNames,
			interfaceNames,
		}, initialState);
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged)
		}
	},[
		name,
		key,
		collectionNames,
		interfaceNames,
		initialState,
		isStateChanged
	]);

	function resetState() {
		setName(initialState.name);
		setKey(initialState.key);
		setCollectionNames(initialState.collectionNames);
		setInterfaceNames(initialState.interfaceNames);
	}

	return {
		apiKeyNames: apiKeys.map(({_name}) => _name),
		collectionNames,
		collectionOptions: queryCollectionsGraph.hits.map(({_name: key}) => ({
			key,
			text: key,
			value: key
		})),
		interfaceNames,
		interfaceOptions: queryInterfacesGraph.hits.map(({_name: key}) => ({
			key,
			text: key,
			value: key
		})),
		isStateChanged,
		key,
		name,
		nameError,
		resetState,
		setCollectionNames,
		setInterfaceNames,
		setKey,
		setName,
		setNameError
	};
}
