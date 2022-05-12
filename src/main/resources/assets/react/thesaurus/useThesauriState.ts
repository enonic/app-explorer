import type {Locales} from '../index.d';
import type {QueryThesauriGraph} from './index.d';

import * as React from 'react';


const GQL_LOCALES_GET = `getLocales {
	country
	#displayCountry
	#displayLanguage
	displayName
	#displayVariant
	#language
	tag
	#variant
}`;

const GQL_THESAURI_QUERY = `queryThesauri {
	total
	count
	hits {
		_id
		_name
		_nodeType
		_path
		#_versionKey
		description
		language {
			from
			to
		}
		synonymsCount
	}
}`;

const GQL_ON_MOUNT = `{
	${GQL_LOCALES_GET}
	${GQL_THESAURI_QUERY}
}`;

const GQL_ON_UPDATE = `{
	${GQL_THESAURI_QUERY}
}`;


export function useThesauriState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const [isLoading, setLoading] = React.useState(false);
	const [locales, setLocales] = React.useState<Locales>([]);
	const [showDelete, setShowDelete] = React.useState(false);
	const [synonymsSum, setSynonymsSum] = React.useState(0);
	const [thesauriRes, setThesauriRes] = React.useState<QueryThesauriGraph>({
		count: 0,
		hits: [],
		total: 0
	});

	const memoizedFetchOnUpdate = React.useCallback(() =>{
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL_ON_UPDATE })
		})
			.then(res => res.json() as Promise<{
				data :{
					queryThesauri :QueryThesauriGraph
				}
			}>)
			.then(res => {
				if (res && res.data) {
					setThesauriRes(res.data.queryThesauri);
					const sum = res.data.queryThesauri.total ? res.data.queryThesauri.hits
						.map(({synonymsCount}) => synonymsCount)
						.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;
					setSynonymsSum(sum);
					setLoading(false);
				} // if
			}); // then
	}, [
		servicesBaseUrl
	]);

	const memoizedFetchOnMount = React.useCallback(() => {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL_ON_MOUNT })
		})
			.then(res => res.json() as Promise<{
				data :{
					getLocales :Locales
					queryThesauri :QueryThesauriGraph
				}
			}>)
			.then(res => {
				if (res && res.data) {
					setLocales(res.data.getLocales);
					setThesauriRes(res.data.queryThesauri);
					const sum = res.data.queryThesauri.total ? res.data.queryThesauri.hits
						.map(({synonymsCount}) => synonymsCount)
						.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;
					setSynonymsSum(sum);
					setLoading(false);
				} // if
			}); // then
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchOnMount(), [
		memoizedFetchOnMount
	]);
	return {
		isLoading,
		locales,
		memoizedFetchOnUpdate,
		setShowDelete,
		showDelete,
		synonymsSum,
		thesauriRes,
		thesaurusNames: thesauriRes.hits.map(({_name}) => _name)
	};
}
