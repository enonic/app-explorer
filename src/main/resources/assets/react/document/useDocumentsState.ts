import * as gql from 'gql-query-builder';
import * as React from 'react';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works
const FIELD_PATH_META = 'document_metadata';


export function useDocumentsState({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	console.debug('servicesBaseUrl', servicesBaseUrl);

	const [documentsRes, setDocumentsRes] = React.useState({
		total: 0,
		hits: []
	});
	const [jsonModalState, setJsonModalState] = React.useState({
		open: false,
		id: '',
		json: '',
	});

	const queryDocuments = React.useCallback(() => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gql.query({
				operation: 'queryDocuments',
				fields: [
					'total',
					{
						hits: [
							'_id',
							'_json',
							FIELD_PATH_META
						]
					}
				]
			}))
		})
			.then(res => res.json())
			.then(json => {
				console.log('json', json);
				setDocumentsRes(json.data.queryDocuments);
			});
	},[
		servicesBaseUrl,
		setDocumentsRes,
	]);

	React.useEffect(() => queryDocuments(), [
		queryDocuments
	]); // Only once

	return {
		documentsRes, setDocumentsRes,
		jsonModalState, setJsonModalState,
	};
}
