import type {JSONResponse} from '../fetchers/index.d';

type GetProfileResponse = JSONResponse<{
	getProfile: {
		documents: {
			columns: string[]|string
		}
	}
}>


import {forceArray} from '@enonic/js-utils';
import * as gql from 'gql-query-builder-ts';
import {GQL_QUERY_PROFILE_GET_NAME} from '../../main/resources/services/graphQL/constants';
import {SELECTED_COLUMNS_DEFAULT} from './constants';


export async function getColumns({
	servicesBaseUrl
}: {
	servicesBaseUrl: string
}) {
	return fetch(`${servicesBaseUrl}/graphQL`, {
		method: 'POST',
		headers: { // HTTP/2 uses lowercase header keys
			'content-type': 'application/json'
		},
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
			return forceArray(columns);
		});
}
