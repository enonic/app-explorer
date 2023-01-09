import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {Hit} from './search/Hits';
import type {
	Profiling,
	Synonyms
} from './search';


import * as gql from 'gql-query-builder';
import * as React from 'react';


type SearchResult = {
	count: number
	hits: Hit[]
	profiling: Profiling[]
	locales: string[]
	synonyms: Synonyms
	total: number
}


function useSearchInterface({
	basename,
	interfaceName,
	setLoading,
	fieldsProp
} :{
	basename: string
	interfaceName: string
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	fieldsProp?: InterfaceField[]
}) {
	const [resultState, setResultState] = React.useState<SearchResult>({
		count: 0,
		hits: [],
		profiling: [],
		locales: [],
		synonyms: [],
		total: 0
	});
	//console.debug('Search result', result);

	const [searchedStringState, setSearchedStringState] = React.useState('');
	// console.debug('Search searchString', searchString);

	function searchFunction({
		searchString,
		start = 0
	}: {
		searchString: string
		start: number
	}) {
		setSearchedStringState('');
		if(!searchString) {
			setResultState({
				count: 0,
				hits: [],
				locales: [],
				profiling: [],
				synonyms: [],
				total: 0
			});
			return;
		}
		/*const cachedResult = getIn(
			cache,
			`${interfaceName}.${searchString}`
		) as SearchResult;
		if (cachedResult) {
			setResult(cachedResult);
			return;
		}*/
		setLoading(true);
		const uri = `${basename}/api/v1/interface/${interfaceName}`;
		// console.debug(uri);

		const variables :Record<string, {
			list?: boolean
			required?: boolean
			type?: string
			value: unknown
		}> = {
			start: {
				list: false,
				required: false,
				type: 'Int',
				value: start
			}
		};
		const fieldsHits :Array<
			string
			|Record<string,Array<string>>
		> = [
			'_collection',
			'_documentType',
		];
		if (fieldsProp.length) {
			fieldsHits.push('_highlight'); // GraphQLJson
			variables['highlight'] = {
				required: false,
				type: 'InputTypeHighlight',
				value: {
					numberOfFragments: 1,
					postTag: '</b>',
					preTag: '<b>',
					fields: fieldsProp.map(({
						name
					}) => ({
						field: name
					}))
				}
			}
		}
		fieldsHits.push('_json');
		fieldsHits.push('_score');

		const gqlQuery = gql.query({
			operation: 'querySynonyms',
			variables: {
				//languages,
				profiling: {
					list: false,
					required: false,
					value: true // TODO Hardcode
				},
				searchString: {
					list: false,
					required: true,
					value: searchString
				}
			},
			fields: [
				'languages',
				{
					profiling: [
						'currentTimeMillis',
						'label',
						'operation'
					]
				},
				{
					synonyms: [
						'_highlight',
						'_score',
						{
							synonyms: [
								'locale',
								'synonym'
							]
						},
						'thesaurusName'
					]
				},
				{
					operation: 'search',
					fields: [
						'count',
						{
							hits: fieldsHits
						},
						{
							profiling: [
								'currentTimeMillis',
								'label',
								'operation'
							]
						},
						'total'
					],
					variables
				}
			]
		}, null, {
			operationName: 'InterfaceSearch'
		});
		//console.debug('Search() gqlQuery:', gqlQuery);
		fetch(uri, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gqlQuery)
		})
			.then(response => response.json())
			.then(aResult => {
				//console.debug('fetch aResult', aResult);
				if (aResult && aResult.data && aResult.data.querySynonyms) {
					const {
						languages,
						profiling,
						search,
						synonyms
					} = aResult.data.querySynonyms;
					const profilingArray = [];
					const currentTimeMillisStart = profiling[0].currentTimeMillis;
					//if(profiling) {
					for (let i = 0; i < profiling.length - 1; i += 1) {
						const durationMs = profiling[i + 1].currentTimeMillis - profiling[i].currentTimeMillis;
						profiling[i + 1].durationMs = durationMs;
						const durationSinceLocalStartMs = profiling[i + 1].currentTimeMillis - profiling[0].currentTimeMillis;
						profiling[i + 1].durationSinceLocalStartMs = durationSinceLocalStartMs;
						profiling[i + 1].durationSinceTotalStartMs = durationSinceLocalStartMs;
						profilingArray.push(profiling[i + 1]);
					}
					//console.log('querySynonyms profiling', profiling);
					//}
					if (search) {
						const {
							profiling
						} = search;
						//if(profiling) {
						for (let i = 0; i < profiling.length - 1; i += 1) {
							const durationMs = profiling[i + 1].currentTimeMillis - profiling[i].currentTimeMillis;
							profiling[i + 1].durationMs = durationMs;
							const durationSinceLocalStartMs = profiling[i + 1].currentTimeMillis - profiling[0].currentTimeMillis;
							profiling[i + 1].durationSinceLocalStartMs = durationSinceLocalStartMs;
							const durationSinceTotalStartMs = profiling[i + 1].currentTimeMillis - currentTimeMillisStart;
							profiling[i + 1].durationSinceTotalStartMs = durationSinceTotalStartMs;
							profilingArray.push(profiling[i + 1]);
						}
						//console.log('search profiling', profiling);
						//}
						//console.log('search profilingArray', profilingArray);
						search.locales = languages;
						search.profiling = profilingArray;

						//if (synonyms) {
						search.synonyms = synonyms;
						//}
						/*setCache(prev => {
							//console.debug('setCache prev', prev);
							const deref = JSON.parse(JSON.stringify(prev));
							if (synonyms) {
								deref.synonyms = synonyms;
							}
							setIn(deref, `${interfaceName}.${searchString}`, search);
							return deref;
						});*/
						// console.debug(`before setResultState()`, search);
						setResultState(search);
					}
				}
				// console.debug(`before setSearchedStringState(${searchString})`);
				setSearchedStringState(searchString);
				setLoading(false);
			}); // fetch
	} // function search
	return {
		resultState,
		searchedStringState,
		searchFunction,
	};
}

export default useSearchInterface;
