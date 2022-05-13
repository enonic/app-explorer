import type {EditSynonymsState} from './index.d';


//import {isSet} from '@enonic/js-utils';
import Uri from 'jsuri';
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
	const [direction, setDirection] = React.useState('ascending');
	const [from, setFrom] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);
	const [perPage, setPerPage] = React.useState(10);
	const [page, setPage] = React.useState(1);
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
			page,
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


	const memoizedHandleSortGenerator = React.useCallback((
		clickedColumn :string = column // avoid infinite loop
	) => () => {
		//console.debug('handleSortGenerator clickedColumn', clickedColumn, 'column', column, 'direction', direction);
		if (clickedColumn === column) {
			setDirection(direction === 'ascending' ? 'descending' : 'ascending');
		} else { // clickedColumn !== column
			setColumn(clickedColumn);
			if (direction !== 'ascending') { // avoid extra setDirection
				setDirection('ascending');
			}
		}
	}, [
		column,
		direction
	]);

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
		memoizedHandleSortGenerator,
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
		start,
		thesauri,
		to,
		total,
		totalPages
	};
}
