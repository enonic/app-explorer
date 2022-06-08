import type {
	FetchQueryStopWordsData,
	QueryStopWordsResult
} from '../../../services/graphQL/fetchers/fetchQueryStopWords';


import moment from 'moment';
import * as React from 'react';
import {fetchQueryStopWords} from '../../../services/graphQL/fetchers/fetchQueryStopWords';
import {useInterval} from '../utils/useInterval';


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
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

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
				setUpdatedAt(moment());
			},
			url: `${servicesBaseUrl}/graphQL`
		});
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedUpdateStopWords(), [
		memoizedUpdateStopWords
	]);

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

	const {
		isLoading,
		queryStopWords
	} = state;

	return {
		durationSinceLastUpdate,
		isLoading,
		memoizedUpdateStopWords,
		queryStopWords,
		setShowDelete,
		showDelete
	};
}
