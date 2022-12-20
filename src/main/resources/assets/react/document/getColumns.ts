import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';

type GetProfileResponse = JSONResponse<{
	getProfile: {
		documents: {
			columns: string[]|string
		}
	}
}>


import {forceArray} from '@enonic/js-utils';
import * as gql from 'gql-query-builder';
import {SELECTED_COLUMNS_DEFAULT} from './constants';


export async function getColumns({
	servicesBaseUrl
}: {
	servicesBaseUrl: string
}) {
	return fetch(`${servicesBaseUrl}/graphQL`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(gql.query({
			operation: 'getProfile'
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
