import type {User} from '/lib/xp/auth';
import {JSONResponse} from '../../../services/graphQL/fetchers';


import * as gql from 'gql-query-builder';
import {GQL_QUERY_USER_GET_NAME} from '../../../services/graphQL/constants';


type FetchUserData = {
	getUser: User
}

async function fetchUser({
	fields = [
		// 'disabled',
		'displayName',
		'email',
		// 'idProvider',
		// 'key',
		'login',
		// 'modifiedTime',
		// 'type'
	],
	url
}: {
	fields?: (keyof User)[]
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
