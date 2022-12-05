import type {
	DropdownItemProps,
} from 'semantic-ui-react';


import * as gql from 'gql-query-builder';
import * as React from 'react';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works
const FIELD_PATH_META = 'document_metadata';

export const COLUMN_NAME_COLLECTION = '_collection';
export const COLUMN_NAME_DOCUMENT_TYPE = '_documentType';
export const COLUMN_NAME_ID = '_id';
export const COLUMN_NAME_JSON = '_json';
export const COLUMN_NAME_LANGUAGE = '_language';

const OPTIONS_COLUMNS_DEFAULT = [{
	text: 'Collection',
	value: COLUMN_NAME_COLLECTION, // 'document_metadata.collection'
},{
	text: 'Document type',
	value: COLUMN_NAME_DOCUMENT_TYPE, // 'document_metadata.documentType'
},{
	text: 'Language',
	value: COLUMN_NAME_LANGUAGE, // 'document_metadata.language'
},{
	text: 'Document ID',
	value: COLUMN_NAME_ID
},{
	text: 'JSON',
	value: COLUMN_NAME_JSON
}]

export function useDocumentsState({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	// console.debug('servicesBaseUrl', servicesBaseUrl);

	const [documentsRes, setDocumentsRes] = React.useState({
		total: 0,
		hits: []
	});

	const [jsonModalState, setJsonModalState] = React.useState({
		open: false,
		id: '',
		json: '',
	});

	const [columnOptions, setColumnOptions] = React.useState<
		DropdownItemProps[]
	>(OPTIONS_COLUMNS_DEFAULT);

	const [selectedColumns, setSelectedColumns] = React.useState([
		COLUMN_NAME_COLLECTION,
		COLUMN_NAME_DOCUMENT_TYPE,
		COLUMN_NAME_LANGUAGE,
		COLUMN_NAME_ID,
		COLUMN_NAME_JSON
	]);

	const [columnsHoverOpen, setColumnsHoverOpen] = React.useState(false);

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
		columnsHoverOpen, setColumnsHoverOpen,
		columnOptions, setColumnOptions,
		documentsRes, setDocumentsRes,
		jsonModalState, setJsonModalState,
		selectedColumns, setSelectedColumns,
	};
}
