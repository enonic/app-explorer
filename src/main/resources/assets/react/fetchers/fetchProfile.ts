import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';
import type {Profile} from '../../..';

type GetProfileResponse = JSONResponse<{
	getProfile: {
		documents?: {
			columns?: string[]|string
		}
	}
}>


import {forceArray} from '@enonic/js-utils';
import * as gql from 'gql-query-builder';
import {GQL_QUERY_PROFILE_GET_NAME} from '../../../services/graphQL/constants';
import {SELECTED_COLUMNS_DEFAULT} from '../document/constants';


async function fetchProfile({
	url
}: {
	url: string
}): Promise<Profile> {
	return fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(gql.query({
			operation: GQL_QUERY_PROFILE_GET_NAME
		}))
	})
		.then(res => res.json() as GetProfileResponse)
		.then(object => {
			// console.log('object', object);
			const {
				documents: {
					columns = [...SELECTED_COLUMNS_DEFAULT] // When there is no profile, use defaults, deref to avoid type issues
				} = {}
			} = object.data.getProfile || {};
			// console.log('columns', columns);
			return {
				documents: {
					columns: forceArray(columns)
				}
			};
		});
}


export default fetchProfile;
