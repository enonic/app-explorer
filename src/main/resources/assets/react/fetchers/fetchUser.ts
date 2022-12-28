import type {
	// Group,
	Principal,
	User,
} from '/lib/xp/auth';
import {JSONResponse} from '../../../services/graphQL/fetchers';

type ExtendedPrincipal = Principal & {
	inherited: boolean
	parent?: ExtendedPrincipal
	// memberships?: ExtendedPrincipal[]
}

import * as gql from 'gql-query-builder';
import {GQL_QUERY_USER_GET_NAME} from '../../../services/graphQL/constants';


type FetchUserData = {
	getUser: User & {
		parent?: ExtendedPrincipal
		// memberships: ExtendedPrincipal[]
	}
}

async function fetchUser({
	fields = [
		// 'disabled',
		'displayName',
		'email',
		// 'idProvider',
		// 'key',
		'login',
		{
			memberships: [
				// 'description',
				'displayName',
				'inherited',
				// 'key',
				// 'modifiedTime',
				{
					parent: [
						'displayName',
						'key'
					]
				},
				'type',
			]
		},
		// 'modifiedTime',
		// 'type'
	],
	url
}: {
	fields?: (
		keyof User|{
			memberships: (
				keyof ExtendedPrincipal|{
					parent: (keyof ExtendedPrincipal)[]
				}
			)[]
		}
	)[]
	url: string
}) {
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify(gql.query({
			operation: GQL_QUERY_USER_GET_NAME,
			variables: null,
			fields
		}))
	})
		.then(response => response.json() as JSONResponse<FetchUserData>)
}

export default fetchUser
