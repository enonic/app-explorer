import type {
	PaginationProps,
	StrictTableHeaderCellProps
} from 'semantic-ui-react';
import type {EditSynonymsState} from './index.d';


//import {isSet} from '@enonic/js-utils';
import * as React from 'react';
import {fetchSynonymsQuery} from '../../../services/graphQL/fetchers/fetchSynonymsQuery';


export function useEditSynonymsState({
	servicesBaseUrl,
	thesaurusName
} :{
	servicesBaseUrl :string
	thesaurusName ?:string
}) {
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
		page: 1,
		start: 1,
		total: 0,
		totalPages: 0
	});
	const [thesauri, setThesauri] = React.useState(thesaurusName ? [thesaurusName] : []);
	const [to, setTo] = React.useState('');

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

	const memoizedQuerySynonyms = React.useCallback(() => {
		//console.debug('querySynonyms params1', params, 'state', state);
		setIsLoading(true);

		const variables = {
			from,
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
		page,
		perPage,
		servicesBaseUrl,
		sort,
		thesauri,
		to
	]); // memoizedQuerySynonyms

	React.useEffect(() => memoizedQuerySynonyms(), [
		memoizedQuerySynonyms
	]);

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
		memoizedQuerySynonyms,
		page,
		perPage,
		result: state,
		setColumn,
		setDirection,
		setFrom,
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
}
