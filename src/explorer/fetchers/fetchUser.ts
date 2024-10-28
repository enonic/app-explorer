import type Fields from 'gql-query-builder-ts/build/Fields';
import type {
	// Group,
	Principal,
	User,
} from '/lib/xp/auth';
import {JSONResponse} from './index.d';

type ExtendedPrincipal = Principal & {
	inherited: boolean
	parent?: ExtendedPrincipal
	// memberships?: ExtendedPrincipal[]
}

import * as gql from 'gql-query-builder-ts';
import {GQL_QUERY_USER_GET_NAME} from '../../main/resources/services/graphQL/constants';


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
			operation: 'getMemberships',
			variables: {
				transitive: {
					list: false,
					required: false,
					type: 'Boolean',
					value: true
				}
			},
			fields: [
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
	fields?: Fields
	// fields?: (
	// 	keyof User|{
	// 		memberships: (
	// 			keyof ExtendedPrincipal|{
	// 				parent: (keyof ExtendedPrincipal)[]
	// 			}
	// 		)[]
	// 	}
	// )[]
	url: string
}) {
	return fetch(url, {
		method: 'POST',
		headers: { // HTTP/2 uses lowercase header keys
			'content-type':	'application/json'
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
