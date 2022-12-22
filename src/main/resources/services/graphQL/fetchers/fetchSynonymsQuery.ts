import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {QueriedSynonym} from '/lib/explorer/types/index.d';


import * as gql from 'gql-query-builder';
import type {JSONResponse}  from './index.d';


export type FetchSynonymsQueryData = {
	querySynonyms :{
		aggregations :{
			thesaurus :AggregationsResponseEntry
		}
		count :number
		end :number
		hits: Array<QueriedSynonym>
		localeToStemmingLanguage :Record<string,string>
		page :number
		start :number
		total :number
		totalPages :number
	}
}


export async function fetchSynonymsQuery({
	url,
	variables,
	variables: {
		//count,
		from,
		languages,
		page,
		perPage,
		query,
		sort,
		thesauri,
		to
	},
	handleData = (data :FetchSynonymsQueryData) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug(
			'fetchSynonymsQuery(',{
				url,
				variables
			},') handleData() --> data:',
			data
		);
	},
	handleResponse = async (response) => {
		const {data, errors} = await response.json() as JSONResponse<FetchSynonymsQueryData>;
		/*console.debug(
			'fetchSynonymsQuery(',{
				url,
				variables
			},') handleResponse() data:',
			data
		);*/
		if (response.ok) {
			return handleData(data);
		} else {
			// handle the graphql errors
			const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown');
			return Promise.reject(error);
		}
	}
} :{
	url :string
	variables :{
		//count ?:number
		from ?:string
		languages ?:Array<string>
		page ?:number,
		perPage ?:number,
		query ?:string,
		sort ?:string,
		thesauri ?:Array<string>,
		to ?:string
	},
	handleData? :(data :FetchSynonymsQueryData) => void,
	handleResponse? :(response :Response) => void
}) {
	const obj = gql.query({
		operation: 'querySynonyms',
		fields: [
			{
				aggregations: [{
					thesaurus: [{
						buckets: [
							'docCount',
							'key'
						]
					}]
				}]
			},
			'count',
			'end',
			{
				hits: [
					'_highlight',
					'_id',
					'_name',
					'_nodeType',
					'_nodeTypeVersion',
					'_path',
					'_score',
					'_versionKey',
					'comment',
					'enabled',
					'disabledInInterfaces',
					{
						languages: [
							{
								both: [
									'comment',
									'enabled',
									'disabledInInterfaces',
									'synonym'
								]
							},
							'comment',
							'enabled',
							'disabledInInterfaces',
							{
								from: [
									'comment',
									'enabled',
									'disabledInInterfaces',
									'synonym'
								]
							},
							'locale',
							{
								to: [
									'comment',
									'enabled',
									'disabledInInterfaces',
									'synonym'
								]
							}
						]
					},
					'thesaurus',
					'thesaurusReference',
				]
			},
			'localeToStemmingLanguage',
			'page',
			//'perPage', // Only in input, not output
			'start',
			'total',
			'totalPages',
		],
		variables: {
			/*count: {
				required: false,
				value: count
			},*/
			from: {
				required: false,
				value: from
			},
			languages: {
				list: true,
				required: false,
				type: 'String',
				value: languages
			},
			page: {
				required: false,
				value: page
			},
			perPage: {
				required: false,
				value: perPage
			},
			query: {
				required: false,
				value: query
			},
			sort: {
				required: false,
				value: sort
			},
			thesaurusNames: {
				required: false,
				type: '[String]',
				value: thesauri
			},
			to: {
				required: false,
				value: to
			}
		}
	});
	//console.debug('obj', obj);
	return await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify(obj)
	})
		.then(response => handleResponse(response));
}
