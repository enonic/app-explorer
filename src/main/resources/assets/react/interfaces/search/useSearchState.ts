import type {PaginationProps} from 'semantic-ui-react';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';



import {useWhenInit} from '@seamusleahy/init-hooks';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import useJsonModalState from '../../components/modals/useJsonModalState';
import useSearchInterface from '../useSearchInterface';
import {useUpdateEffect} from '../../utils/useUpdateEffect';


type InterfaceName = string;
type SearchString = string;

export type SearchProps = {
	basename: string
	servicesBaseUrl: string
	//documentTypesAndFields ?:Record<string,Fields>
	fields?: InterfaceField[]
	firstColumnWidth?: 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15
	interfaceName?: InterfaceName
	searchString?: SearchString
}



const DEBUG_DEPENDENCIES = false;

export function useSearchState({
	basename,
	servicesBaseUrl,
	// Optional
	fieldsProp = [],
	interfaceNameProp = 'default',
	searchStringProp,
}: {
	basename: string
	searchStringProp: SearchString
	servicesBaseUrl: string
	// Optional
	fieldsProp?: InterfaceField[]
	interfaceNameProp?: InterfaceName
}) {
	//console.debug('Search({fields:', fieldsProp,'})');
	//console.debug('Search interfaceName', interfaceNameProp);

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	// const [boolOnChange, setBoolOnChange] = React.useState(false);
	//console.debug('Search boolOnChange', boolOnChange);
	const [interfaceCollectionCount, setInterfaceCollectionCount] = React.useState<number>();
	const [interfaceDocumentCount, setInterfaceDocumentCount] = React.useState<number>();
	const [page, setPage] = React.useState(1);
	const {
		state: jsonModalState,
		setState: setJsonModalState
	} = useJsonModalState();

	const [loading, setLoading] = React.useState(false);
	//console.debug('Search loading', loading);
	const [
		perPage,
		// setPerPage,
	] = React.useState(10);
	const [searchString, setSearchString] = React.useState(searchStringProp || '');

	//const [cache, setCache] = React.useState({} as Cache);
	//console.debug('Search cache', cache);

	const [start, setStart] = React.useState(0);

	const {
		resultState,
		searchedStringState,
		searchFunction,
	} = useSearchInterface({
		basename,
		fieldsProp,
		interfaceName: interfaceNameProp,
		setLoading
	});

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks
	//──────────────────────────────────────────────────────────────────────────
	const getInterfaceCollectionCount = React.useCallback(() => {
		if (interfaceNameProp === 'default') {
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'queryCollections',
					fields: ['total']
				}))
			})
				.then(response => response.json())
				.then(json => {
					// console.debug('json', json);
					setInterfaceCollectionCount(json.data.queryCollections.total);
				});
		} else {
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'queryInterfaces',
					fields: [{
						hits: [
							'_name',
							'collectionIds'
						]
					}]
				}))
			})
				.then(response => response.json())
				.then(json => {
					// console.debug('json', json);
					const {hits} = json.data.queryInterfaces
					let found = false;
					for (let i = 0; i < hits.length; i++) {
						const {
							_name,
							collectionIds
						} = hits[i];
						if (_name === interfaceNameProp) {
							found = true;
							setInterfaceCollectionCount(collectionIds.length);
						}
					} // for
					if (!found) {
						setInterfaceCollectionCount(0);
					}
				});
		}
	}, [
		interfaceNameProp,
		servicesBaseUrl
	]);

	const getInterfaceDocumentCount = React.useCallback(() => {
		// console.debug('getInterfaceDocumentCount interfaceNameProp:', interfaceNameProp);
		fetch(`${basename}/api/v1/interface/${interfaceNameProp}`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query({
				operation: 'search',
				variables: {
					count: {
						value: 0
					},
					// query: {
					// 	required: false,
					// 	type: 'QueryDSL',
					// 	value: {
					// 		matchAll: {}
					// 	}
					// }
				},
				fields: ['total']
			}))
		})
			.then(response => response.json())
			.then(json => {
				// console.debug('json', json);
				// console.debug('setInterfaceDocumentCount:', json.data.search.total);
				setInterfaceDocumentCount(json.data.search.total);
			});
	}, [
		basename,
		interfaceNameProp
	]);

	const handlePaginationChange = React.useCallback((
		_event: React.MouseEvent<HTMLAnchorElement>,
		data: PaginationProps
	) => {
		const {activePage: newPage} = data;
		DEBUG_DEPENDENCIES && console.debug('handlePaginationChange callback called. newPage:', newPage);
		setPage(newPage as number);
		const newStart = (newPage as number - 1 ) * perPage;
		// if (newStart !== start) {
		// 	setStart(newStart)
		// }
		searchFunction({
			searchString,
			start: newStart
		});
	}, [ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		perPage,
		searchFunction,
		searchString,
		// start
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Init only
	//──────────────────────────────────────────────────────────────────────────
	useWhenInit(() => {
		getInterfaceCollectionCount();
		getInterfaceDocumentCount();
		searchFunction({
			searchString,
			start: 0
		});
	});

	//──────────────────────────────────────────────────────────────────────────
	// Update only (not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		console.debug('update page:', page, 'perPage:', perPage, 'start:', start);
		const newStart = (page as number - 1 ) * perPage;
		if (newStart !== start) {
			setStart(newStart)
		}
	}, [
		page,
		perPage,
		start
	])

	//──────────────────────────────────────────────────────────────────────────
	// Returns
	//──────────────────────────────────────────────────────────────────────────
	return {
		// boolOnChange, setBoolOnChange,
		interfaceCollectionCount, setInterfaceCollectionCount,
		interfaceDocumentCount, setInterfaceDocumentCount,
		handlePaginationChange,
		jsonModalState, setJsonModalState,
		loading, setLoading,
		page, setPage,
		perPage, // setPerPage,
		resultState,
		searchFunction,
		searchedStringState,
		searchString, setSearchString,
		start, // setStart,
	}
}
