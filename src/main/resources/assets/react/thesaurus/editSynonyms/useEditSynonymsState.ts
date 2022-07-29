import type {
	PaginationProps,
	StrictTableHeaderCellProps
} from 'semantic-ui-react';
import type {QueriedSynonym} from '/lib/explorer/types/index.d';


//import {isSet} from '@enonic/js-utils';
import * as React from 'react';
import {fetchSynonymsQuery} from '../../../../services/graphQL/fetchers/fetchSynonymsQuery';


type EditSynonymsState = {
	aggregations: {
		thesaurus: {
			buckets: Array<{
				docCount :number
				key :string
			}>
		}
	},
	count :number
	end :number
	hits :Array<QueriedSynonym>
	localeToStemmingLanguage :Record<string,string>
	page :number
	start :number
	total :number
	totalPages :number
}


export function useEditSynonymsState({
	servicesBaseUrl,
	thesaurusName
} :{
	servicesBaseUrl :string
	thesaurusName ?:string
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [languages, setLanguages] = React.useState([]);
	const [column, setColumn] = React.useState('from');
	const [direction, setDirection] = React.useState<StrictTableHeaderCellProps['sorted']>('ascending');
	const [from, setFrom] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);
	const [perPage, setPerPage] = React.useState(10);
	const [page, setPage] = React.useState<PaginationProps['activePage']>(1);
	const [sort, setSort] = React.useState('from ASC');
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
	const [thesauri, setThesauri] = React.useState(thesaurusName ? [thesaurusName] : []);
	const [to, setTo] = React.useState('');

	//──────────────────────────────────────────────────────────────────────────
	// Functions
	//──────────────────────────────────────────────────────────────────────────
	// Since this function has no dependencies, there is no point in memoizing it.
	const sortAfterColumnClick = (clickedColumn :string, currentColumn :string, currentDirection :string) => {
		console.debug('sortAfterColumnClick(%s, %s, %s)', clickedColumn, currentColumn, currentDirection)
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
	const memoizedQuerySynonyms = React.useCallback(() => {
		//console.debug('querySynonyms params1', params, 'state', state);
		setIsLoading(true);

		const variables = {
			from,
			languages,
			page: page as number,
			perPage,
			sort,
			thesauri,
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
		from,
		languages,
		page,
		perPage,
		servicesBaseUrl,
		sort,
		thesauri,
		to
	]); // memoizedQuerySynonyms

	//──────────────────────────────────────────────────────────────────────────
	// Effects
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		const newSort = `${column} ${direction === 'ascending' ? 'ASC' : 'DESC'}`;
		if (newSort !== sort) {
			setSort(newSort);
		}
	}, [
		column,
		direction,
		sort
	]);

	React.useEffect(() => memoizedQuerySynonyms(), [
		memoizedQuerySynonyms
	]);

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
		column,
		direction,
		end,
		from,
		isLoading,
		languages,
		memoizedQuerySynonyms,
		page,
		perPage,
		result: state,
		setColumn,
		setDirection,
		setFrom,
		setLanguages,
		setPage,
		setPerPage,
		setThesauri,
		setTo,
		sortAfterColumnClick,
		start,
		thesauri,
		to,
		total,
		totalPages
	};
} // function useEditSynonymsState
