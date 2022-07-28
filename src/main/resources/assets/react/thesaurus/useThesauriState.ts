import type {Locales} from '../index.d';
import type {EditSynonymsModalState} from './editSynonyms/EditSynonymsModal';
import type {
	NewOrEditState,
	QueryThesauriGraph
} from './index.d';


import * as gql from 'gql-query-builder';
import moment from 'moment';
import * as React from 'react';
import {useInterval} from '../utils/useInterval';


const GQL_LOCALES_GET = {
	operation: 'getLocales',
	fields: [
		'country',
		//displayCountry
		//displayLanguage
		'displayName',
		//displayVariant
		//language
		'tag'
		//variant
	]
};

const GQL_THESAURI_QUERY = {
	operation: 'queryThesauri',
	fields: [
		'count',
		{
			hits: [
				'_id',
				'_name',
				//'_nodeType',
				//'_path',
				//'_versionKey',
				'allowedLanguages',
				//'description',
				'synonymsCount'
			]
		},
		'total'
	]
};

const GQL_ON_MOUNT = JSON.stringify(gql.query([
	GQL_LOCALES_GET,
	GQL_THESAURI_QUERY
]));

const GQL_ON_UPDATE = JSON.stringify(gql.query([
	GQL_THESAURI_QUERY
]));



export const NEW_OR_EDIT_STATE_DEFAULT :NewOrEditState = {
	_id: undefined,
	open: false,
};


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
	const [newOrEditState, setNewOrEditState] = React.useState<NewOrEditState>(NEW_OR_EDIT_STATE_DEFAULT);
	const [editSynonymsModalState, setEditSynonymsModalState] = React.useState<EditSynonymsModalState>({
		_id: undefined,
		open: false
	});
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const memoizedFetchOnUpdate = React.useCallback(() =>{
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: GQL_ON_UPDATE
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
					setUpdatedAt(moment());
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
			body: GQL_ON_MOUNT
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
					setUpdatedAt(moment());
					setLoading(false);
				} // if
			}); // then
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchOnMount(), [
		memoizedFetchOnMount
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

	return {
		durationSinceLastUpdate,
		editSynonymsModalState,
		isLoading,
		locales,
		memoizedFetchOnUpdate,
		newOrEditState,
		setEditSynonymsModalState,
		setNewOrEditState,
		setShowDelete,
		showDelete,
		synonymsSum,
		thesauriRes,
		thesaurusNames: thesauriRes.hits.map(({_name}) => _name)
	};
}
