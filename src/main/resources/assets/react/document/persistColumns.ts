import type {JSONResponse} from '../../../services/graphQL/fetchers/index.d';

type ModifyProfileResponse = JSONResponse<{
	modifyProfile: {
		columns?: string[]
	}
}>

import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder-ts';


export async function persistColumns({
	columns: columnsParam,
	getColumns,
	servicesBaseUrl
}: {
	columns: string[]
	getColumns: ({servicesBaseUrl}: {servicesBaseUrl: string}) => Promise<string[]>
	servicesBaseUrl: string
}) {
	return getColumns({servicesBaseUrl}).then(prevColumns => {
		if (fastDeepEqual(columnsParam, prevColumns)) {
			// console.debug('columns unchanged', prevColumns);
			return prevColumns;
		} else {
			// console.debug('columns changed', columnsParam, 'prev', prevColumns);
			return fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type': 'application/json'
				},
				body: JSON.stringify(gql.mutation({
					operation: 'modifyProfile',
					variables: {
						object: {
							list: false,
							required: true,
							type: 'JSON',
							value: {
								columns: columnsParam
							}
						},
						scope: {
							list: false,
							required: true,
							type: 'String',
							value: 'documents'
						}
					}
				}))
			})
				.then(res => res.json() as ModifyProfileResponse)
				.then((object) => {
					// console.log('object', object);
					const {
						columns// = SELECTED_COLUMNS_DEFAULT // This will reset to default when all columns are removed
					} = object.data.modifyProfile;
					return columns;
				});
		}
	});


}
