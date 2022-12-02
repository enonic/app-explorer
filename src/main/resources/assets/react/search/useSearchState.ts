import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {Hit} from './Hits';
import type {
	Profiling,
	Synonyms
} from './index.d';


import * as gql from 'gql-query-builder';
import * as React from 'react';


type InterfaceName = string;
type SearchString = string;

export type SearchProps = {
	servicesBaseUrl: string
	//documentTypesAndFields ?:Record<string,Fields>
	fields?: InterfaceField[]
	firstColumnWidth?: 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15
	interfaceName?: InterfaceName
	searchString?: SearchString
}

type SearchResult = {
	count :number
	hits :Array<Hit>
	profiling :Array<Profiling>
	locales :Array<string>
	synonyms :Synonyms
	total :number
}


export function useSearchState({
	servicesBaseUrl,
	// Optional
	fieldsProp = [],
	interfaceNameProp = 'default',
	searchStringProp,
}: {
	searchStringProp: SearchString
	servicesBaseUrl: string
	// Optional
	fieldsProp?: InterfaceField[]
	interfaceNameProp?: InterfaceName
}) {
	//console.debug('Search({fields:', fieldsProp,'})');
	//console.debug('Search interfaceName', interfaceNameProp);

	const [boolOnChange, setBoolOnChange] = React.useState(false);
	//console.debug('Search boolOnChange', boolOnChange);
	const [interfaceCollectionCount, setInterfaceCollectionCount] = React.useState<number>();
	const [interfaceDocumentCount, setInterfaceDocumentCount] = React.useState<number>();

	const [loading, setLoading] = React.useState(false);
	//console.debug('Search loading', loading);

	const [searchString, setSearchString] = React.useState(searchStringProp || '');
	const [searchedString, setSearchedString] = React.useState('');
	//console.debug('Search searchString', searchString);

	//const [cache, setCache] = React.useState({} as Cache);
	//console.debug('Search cache', cache);

	const [result, setResult] = React.useState<SearchResult>({
		count: 0,
		hits: [],
		profiling: [],
		locales: [],
		synonyms: [],
		total: 0
	});
	//console.debug('Search result', result);

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
		fetch(`./explorer/api/v1/interface/${interfaceNameProp}`, {
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
				setInterfaceDocumentCount(json.data.search.total);
			});
	}, [
		interfaceNameProp
	]);

	function search(ss :string) {
		setSearchedString('');
		if(!ss) {
			setResult({
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
			`${interfaceName}.${ss}`
		) as SearchResult;
		if (cachedResult) {
			setResult(cachedResult);
			return;
		}*/
		setLoading(true);
		const uri = `./explorer/api/v1/interface/${interfaceNameProp}`;
		//console.debug(uri);

		const variables :Record<string, {
			required ?:boolean
			type ?:string
			value :unknown
		}> = {};
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
					value: ss
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
							setIn(deref, `${interfaceName}.${ss}`, search);
							return deref;
						});*/
						setResult(search);
					}
				}
				setSearchedString(ss);
				setLoading(false);
			}); // fetch
	} // function search

	React.useEffect(() => {
		getInterfaceCollectionCount();
		getInterfaceDocumentCount();
		search(searchString);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		boolOnChange, setBoolOnChange,
		interfaceCollectionCount, setInterfaceCollectionCount,
		interfaceDocumentCount, setInterfaceDocumentCount,
		loading, setLoading,
		result, setResult,
		search,
		searchedString, setSearchedString,
		searchString, setSearchString,
	}
}
