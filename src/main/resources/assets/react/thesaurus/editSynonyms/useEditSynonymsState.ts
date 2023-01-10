import type {
	// PaginationProps,
	StrictTableHeaderCellProps
} from 'semantic-ui-react';
import type {QueriedSynonym} from '/lib/explorer/types/index.d';

//import {isSet} from '@enonic/js-utils';
import {useWhenInitAsync} from '@seamusleahy/init-hooks';
import * as React from 'react';
import {fetchSynonymsQuery} from '../../../../services/graphQL/fetchers/fetchSynonymsQuery';
import {useUpdateEffect} from '../../utils/useUpdateEffect';


type EditSynonymsState = {
	aggregations: {
		thesaurus: {
			buckets: Array<{
				docCount: number
				key: string
			}>
		}
	},
	count: number
	end: number
	hits: QueriedSynonym[]
	localeToStemmingLanguage: Record<string,string>
	page: number
	start: number
	total: number
	totalPages: number
}


const DEBUG_DEPENDENCIES = false;


export function useEditSynonymsState({
	servicesBaseUrl,
	thesaurusName
}: {
	servicesBaseUrl: string
	thesaurusName?: string
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [languagesState, setLanguagesState] = React.useState([]);
	const [column, setColumn] = React.useState('_score');
	const [direction, setDirection] = React.useState<StrictTableHeaderCellProps['sorted']>('ascending');
	const [fromState, setFromState] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);
	const [perPageState, setPerPageState] = React.useState(10);
	const [pageState, setPageState] = React.useState<number/*PaginationProps['activePage']*/>(1);
	const [sortState, setSortState] = React.useState('_score ASC');
	const [state, setState] = React.useState<EditSynonymsState>({
		aggregations: {
			thesaurus: {
				buckets: []
			}
		},
		count: 0,
		end: 0,
		hits: [],
		localeToStemmingLanguage: {},
		page: 1,
		start: 1,
		total: 0,
		totalPages: 0
	});
	const [thesauriState, setThesauriState] = React.useState(thesaurusName ? [thesaurusName] : []);
	const [toState, setToState] = React.useState('');

	//──────────────────────────────────────────────────────────────────────────
	// Functions
	//──────────────────────────────────────────────────────────────────────────
	// Since this function has no dependencies, there is no point in memoizing it.
	const sortAfterColumnClick = (clickedColumn: string, currentColumn: string, currentDirection: string) => {
		//console.debug('sortAfterColumnClick(%s, %s, %s)', clickedColumn, currentColumn, currentDirection)
		//console.debug('handleSortGenerator clickedColumn', clickedColumn, 'column', column, 'direction', direction);
		if (clickedColumn === currentColumn) {
			setDirection(currentDirection === 'ascending' ? 'descending' : 'ascending');
		} else { // clickedColumn !== column
			setColumn(clickedColumn);
			if (currentDirection !== 'ascending') { // avoid extra setDirection
				setDirection('ascending');
			}
		}
	}

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks
	//──────────────────────────────────────────────────────────────────────────
	const memoizedQuerySynonyms = React.useCallback(({
		from,
		languages,
		page,
		perPage,
		sort,
		to,
	}: {
		from: string
		languages: string[]
		page: number
		perPage: number
		sort: string
		to: string
	}) => {
		DEBUG_DEPENDENCIES && console.debug('callback memoizedQuerySynonyms params', {
			languages,
			page,
			perPage,
			sort,
		}, 'state', {
			servicesBaseUrl,
			thesauriState
		});
		//console.debug('querySynonyms params1', params, 'state', state);
		setIsLoading(true);

		const variables = {
			from,
			languages,
			page,
			perPage,
			sort,
			thesauri: thesauriState,
			to
		};

		fetchSynonymsQuery({
			url: `${servicesBaseUrl}/graphQL`,
			variables,
			handleData: (data) => {
				//console.debug('fetchSynonymsQuery handleData data', data);
				setState(data.querySynonyms);
				setIsLoading(false);
			}
		});
	}, [
		servicesBaseUrl,
		thesauriState
	]); // memoizedQuerySynonyms

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		DEBUG_DEPENDENCIES && console.debug('init');
		memoizedQuerySynonyms({
			from: fromState,
			languages: languagesState,
			page: pageState,
			perPage: perPageState,
			sort: sortState,
			to: toState,
		});
	});

	//──────────────────────────────────────────────────────────────────────────
	// Effects
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		DEBUG_DEPENDENCIES && console.debug('useEffect', {
			column,
			direction,
			sortState
		});
		const newSort = `${column} ${direction === 'ascending' ? 'ASC' : 'DESC'}`;
		if (newSort !== sortState) {
			setSortState(newSort);
		}
	}, [
		column,
		direction,
		sortState
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates (not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		DEBUG_DEPENDENCIES && console.debug('useUpdateEffect', {
			languagesState,
			pageState,
			perPageState,
			sortState,
			thesauriState,
		});
		memoizedQuerySynonyms({
			from: fromState,
			languages: languagesState,
			page: pageState,
			perPage: perPageState,
			sort: sortState,
			to: toState,
		});
	}, [
		// fromState, // No we don't want to search on every change in fromState
		languagesState,
		pageState,
		perPageState,
		sortState,
		thesauriState,
		// toState, // No we don't want to search on every change in toState
	])

	//──────────────────────────────────────────────────────────────────────────
	// Return
	//──────────────────────────────────────────────────────────────────────────
	const {
		aggregations,
		end,
		start,
		total,
		totalPages
	} = state;
	//console.debug('EditSynonyms result', result);
	return {
		aggregations,
		column, setColumn,
		direction, setDirection,
		end,
		fromState, setFromState,
		isLoading,
		languagesState, setLanguagesState,
		memoizedQuerySynonyms,
		pageState, setPageState,
		perPageState, setPerPageState,
		result: state,
		sortAfterColumnClick,
		sortState, // setSortState,
		start,
		thesauriState, setThesauriState,
		toState, setToState,
		total,
		totalPages
	};
} // function useEditSynonymsState
