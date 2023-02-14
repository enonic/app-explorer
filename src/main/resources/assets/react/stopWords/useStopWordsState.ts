import type {
	FetchQueryStopWordsData,
	QueryStopWordsResult
} from '../../../services/graphQL/fetchers/fetchQueryStopWords';


import * as React from 'react';
import {fetchQueryStopWords} from '../../../services/graphQL/fetchers/fetchQueryStopWords';


export function useStopWordsState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const [showDelete, setShowDelete] = React.useState(false);
	const [state, setState] = React.useState({
		queryStopWords: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: false
	} as {
		isLoading :boolean
		queryStopWords :QueryStopWordsResult
	});

	const memoizedUpdateStopWords = React.useCallback(() => {
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = true;
			return deref;
		});
		fetchQueryStopWords({
			handleData: (data :FetchQueryStopWordsData) => {
				setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.queryStopWords = data.queryStopWords;
					deref.isLoading = false;
					return deref;
				});
			},
			url: `${servicesBaseUrl}/graphQL`
		});
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedUpdateStopWords(), [
		memoizedUpdateStopWords
	]);

	const {
		isLoading,
		queryStopWords
	} = state;

	return {
		isLoading,
		memoizedUpdateStopWords,
		queryStopWords,
		setShowDelete,
		showDelete
	};
}
