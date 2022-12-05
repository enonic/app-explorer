import type {
	DropdownItemProps,
} from 'semantic-ui-react';


// import {isNumber} from '@enonic/js-utils';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import traverse from 'traverse';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works
const FIELD_PATH_META = 'document_metadata';

export const COLUMN_NAME_COLLECTION = '_collection';
export const COLUMN_NAME_DOCUMENT_TYPE = '_documentType';
export const COLUMN_NAME_ID = '_id';
export const COLUMN_NAME_JSON = '_json';
export const COLUMN_NAME_LANGUAGE = '_language';

export const SELECTED_COLUMNS_DEFAULT = [
	COLUMN_NAME_COLLECTION,
	COLUMN_NAME_DOCUMENT_TYPE,
	COLUMN_NAME_LANGUAGE,
	COLUMN_NAME_ID,
	COLUMN_NAME_JSON,
];

const OPTIONS_COLUMNS_DEFAULT: DropdownItemProps[] = [{
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

	const [jsonModalState, setJsonModalState] = React.useState<{
		open: boolean
		id: string
		parsedJson: Record<string,unknown>
	}>({
		open: false,
		id: '',
		parsedJson: undefined,
	});

	const [columnOptions, setColumnOptions] = React.useState<
		DropdownItemProps[]
	>(OPTIONS_COLUMNS_DEFAULT);

	const [selectedColumns, setSelectedColumns] = React.useState(SELECTED_COLUMNS_DEFAULT);

	const [columnsHoverOpen, setColumnsHoverOpen] = React.useState(false);

	// const [fields, setFields] = React.useState([]);

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
				// console.log('json', json);
				const {hits = []} = json.data.queryDocuments;
				const fields: string[] = [];
				for (let i = 0; i < hits.length; i++) {
					const {_json} = hits[i];
					let obj = {};
					try {
						obj = JSON.parse(_json);
						// console.log('_json', _json);

						const paths = traverse(obj).paths();
						// console.log('paths', paths);

						for (let j = 0; j < paths.length; j++) {
							const pathParts = paths[j];
							// console.log('pathParts', pathParts);

							let path = '';
							partsLoop: for (let k = 0; k < pathParts.length; k++) {
								const part = pathParts[k];
								if (parseInt(part, 10).toString() === part) {
									// console.log('isNumber', part);
									path = pathParts.slice(0,k).join('.');
									break partsLoop;
								}
							} // for partsLoop

							if (!path) {
								path = pathParts.join('.');
							}

							if (path && !fields.includes(path)) {
								// console.log('path', path);
								fields.push(path);
							}
						} // for json obj paths
					} catch(e) {
						//no-op
					}
					json.data.queryDocuments.hits[i].parsedJson = obj; // Could do this instead of then TypedReactJson.src
				} // for hits
				fields.sort();
				// console.log('fields', fields);
				// setFields(fields);
				const newColumnOptions = OPTIONS_COLUMNS_DEFAULT.concat(
					fields.map((field) => ({
						text: field,
						value: field
					}))
				);
				// console.log('newColumnOptions', newColumnOptions);
				setColumnOptions(newColumnOptions);

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
		columnOptions, // setColumnOptions,
		documentsRes, // setDocumentsRes,
		// fields, setFields,
		jsonModalState, setJsonModalState,
		selectedColumns, setSelectedColumns,
	};
}
