import type {
	PaginationProps,
	StrictTableHeaderCellProps
} from 'semantic-ui-react';


import Uri from 'jsuri';
import moment from 'moment';
import * as React from 'react';
import {useInterval} from '../utils/useInterval';


type Direction = StrictTableHeaderCellProps['sorted'];


export function useJournalsState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const [columns, setColumns] = React.useState({
		name: true,
		startTime: true,
		endTime: true,
		duration: true,
		errorCount: true,
		successCount: true
	});
	const [loading, setLoading] = React.useState(false);
	const [params, setParams] = React.useState({
		collections: [],
		//endTimeRanges: '',
		showWithoutErrors: true,
		perPage: 25,
		page: 1,
		query: '',
		sort: 'endTime DESC'
	});
	const column = params.sort.split(' ')[0];
	const direction :Direction = params.sort.split(' ')[1] === 'DESC' ? 'descending' : 'ascending';
	const [result, setResult] = React.useState({
		aggregations: {
			collection: {
				buckets: []
			}/*,
			endTime: {
				buckets: []
			},
			startTime: {
				buckets: []
			}*/
		},
		count: 0,
		end: 0,
		page: 1,
		start: 0,
		total: 0,
		totalPages: 0,
		hits: []
	} as {
		aggregations :{
			collection: {
				buckets :Array<unknown>
			}
		}
		count :number
		end :number
		hits :Array<unknown>
		page :number
		start :number
		total :number
		totalPages :number
	});
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const memoizedSearchJournals = React.useCallback(() => {
		setLoading(true); // Make sure this happens before setResult below?
		const uri = new Uri(`${servicesBaseUrl}/journals`);
		Object.keys(params).forEach((k) => {
			const v = params[k];
			//console.debug({k, v});
			uri.replaceQueryParam(k, v);
		});
		const uriStr = uri.toString();
		fetch(uriStr).then(response => response.json())
			.then(data => {
				setResult(data.result);
				setUpdatedAt(moment());
				setLoading(false);
			});
	},[
		params,
		servicesBaseUrl
	]);

	function handleCheckboxChange(
		_event :React.ChangeEvent<HTMLInputElement>,
		{checked, name}
	) {
		//console.debug({function: 'handleCheckboxChange', name, checked});
		if (name === 'showWithoutErrors') {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.showWithoutErrors = !prevParams.showWithoutErrors;
				return derefParams;
			});
		/*} else if(name.startsWith('endTimeRange')) {
			console.debug(name);
			const range = name.replace(/^endTimeRange\./, '');
			console.debug(range);
			await setState(prevState => {
				const endTimeRangesStr = prevState.params.endTimeRanges;
				const endTimeRangesObj = {};
				endTimeRangesStr.split(',').forEach(r => {
					if(r) {
						endTimeRangesObj[r] = true;
					}
				});
				if(checked) {
					endTimeRangesObj[range] = true;
				} else {
					endTimeRangesObj[range] = undefined;
				}
				prevState.params.endTimeRanges = Object.keys(endTimeRangesObj).join(',');
				console.debug({'prevState.params.endTimeRanges': prevState.params.endTimeRanges});
				return prevState;
			});
			search();*/
		} else {
			setColumns(prevColumns => {
				const derefColumns = JSON.parse(JSON.stringify(prevColumns));
				derefColumns[name] = checked;
				return derefColumns;
			});
		}
	} // function handleCheckboxChange

	function handleInputChange(
		_event :React.ChangeEvent<HTMLInputElement>,
		{name, value}
	) {
		//console.debug({function: 'handleInputChange', name, value});
		//console.debug({name, value});
		setParams(prevParams => {
			const derefParams = JSON.parse(JSON.stringify(prevParams));
			derefParams[name] = value;
			return derefParams;
		});
	} // handleInputChange

	function handlePaginationChange(
		//@ts-ignore
		event :React.MouseEvent<HTMLAnchorElement>,
		data :PaginationProps
	) {
		const {activePage} = data;
		//console.debug({function: 'handlePaginationChange', activePage});
		setParams(prevParams => {
			const derefParams = JSON.parse(JSON.stringify(prevParams));
			derefParams.page = activePage;
			return derefParams;
		});
	} // handlePaginationChange

	function handleSort({target} :React.SyntheticEvent<
		HTMLTableCellElement, React.MouseEvent<HTMLTableCellElement>
	>) {
		//console.debug({function: 'handleSort'});
		//console.debug({target});
		//console.debug({column, direction});
		const clickedColumn = (target as HTMLTableCellElement).getAttribute('name');
		//console.debug({clickedColumn});

	    if (column !== clickedColumn) {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.page = 1;
				derefParams.sort = `${clickedColumn} ASC`;
				return derefParams;
			});
	    } else {
			setParams(prevParams => {
				const derefParams = JSON.parse(JSON.stringify(prevParams));
				derefParams.page = 1;
				derefParams.sort = `${clickedColumn} ${direction === 'ascending' ? 'DESC' : 'ASC'}`;
				return derefParams;
			});
		}
	} // handleSort

	React.useEffect(() => {
		memoizedSearchJournals();
	}, [
		memoizedSearchJournals
	]);

	React.useEffect(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, [
		updatedAt
	]);

	useInterval(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, 5000);

	const {
		aggregations,
		//count,
		end,
		page,
		start,
		total,
		totalPages,
		hits
	} = result;

	return {
		aggregations,
		column,
		columns,
		direction,
		durationSinceLastUpdate,
		end,
		handleCheckboxChange,
		handleInputChange,
		handlePaginationChange,
		handleSort,
		hits,
		loading,
		memoizedSearchJournals,
		page,
		params,
		start,
		total,
		totalPages
	};
}
