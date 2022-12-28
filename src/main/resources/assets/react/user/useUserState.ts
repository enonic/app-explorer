import type {Profile} from '../../..';


import * as React from 'react';
import {useWhenInit} from '@seamusleahy/init-hooks';
import fetchProfile from '../fetchers/fetchProfile';


function useUserState({
	servicesBaseUrl
}: {
	servicesBaseUrl: string
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [profileState, setProfileState] = React.useState<Profile>({
		documents: {
			columns: []
		}
	});

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	useWhenInit(() => {
		fetchProfile({
			url: `${servicesBaseUrl}/graphQL`
		}).then(profile => {
			setProfileState(profile);
		})
	});

	//──────────────────────────────────────────────────────────────────────────
	// Return
	//──────────────────────────────────────────────────────────────────────────
	return {
		profileState, // setProfileState,
	};
}

export default useUserState;
