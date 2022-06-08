import type {QueryApiKeysGraph} from './index.d';


import moment from 'moment';
import * as React from 'react';
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
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');
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
					setUpdatedAt(moment());
				}
				setIsLoading(false);
			});
	},[
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchApiKeys(), [
		memoizedFetchApiKeys
	]); // Only once

	React.useEffect(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, [
		updatedAt
	]);

	useInterval(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, 5000);


	return {
		apiKeys: queryApiKeysGraph.hits,
		durationSinceLastUpdate,
		isLoading,
		memoizedFetchApiKeys
	};
}
