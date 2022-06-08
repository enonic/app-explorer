import fastDeepEqual from 'fast-deep-equal/react';
import moment from 'moment';
import * as React from 'react';
import {useInterval} from '../utils/useInterval';


export function useNotificationsState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const [emails, setEmails] = React.useState<Array<string>>(['']);
	const [initialState, setInitialState] = React.useState<Array<string>>(['']);
	const [isStateChanged, setIsStateChanged] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');
	//console.debug('initialValues', initialValues);

	const memoizedFetchNotifications = React.useCallback(() => {
		setIsLoading(true);
		fetch(`${servicesBaseUrl}/notifications`)
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				const newEmails = data.emails || [''];
				setEmails(newEmails);
				setInitialState(newEmails);
				setUpdatedAt(moment());
				setIsLoading(false);
			});
	}, [
		servicesBaseUrl
	]);

	// Once on mount
	React.useEffect(() => memoizedFetchNotifications(), [
		memoizedFetchNotifications
	]);

	// On "any" change
	React.useEffect(() => {
		const newIsStateChanged = !fastDeepEqual(emails, initialState);
		if (newIsStateChanged !== isStateChanged) {
			setIsStateChanged(newIsStateChanged)
		}
	}, [
		emails,
		initialState,
		isStateChanged
	]);

	useInterval(() => {
		if (updatedAt) {
			setDurationSinceLastUpdate(
				moment
					.duration(updatedAt.diff(moment()))
					.humanize()
			);
		}
	}, 5000);

	function resetState() {
		setEmails(initialState);
	}

	//console.debug('initialValues', initialValues);
	return {
		durationSinceLastUpdate,
		emails,
		isLoading,
		isStateChanged,
		memoizedFetchNotifications,
		resetState,
		setEmails,
		setIsLoading
	};
}
