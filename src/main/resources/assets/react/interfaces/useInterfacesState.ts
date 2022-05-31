import type {InterfaceNamesObj} from './index.d';


import * as React from 'react';


type Collection = {
	_id :string
	_name :string
	documentTypeId :string
	docCount ?:number
}


const GQL_COLLECTIONS = `queryCollections(
	perPage: -1
) {
	hits {
		_id
		_name
		documentTypeId
	}
}`;

const GQL_DOCUMENTS = `queryDocuments(
    aggregations: [{
    	name: "collections"
    	terms: {
			field: collectionName
		}
	}]
    count: 0
)
{
	aggregations {
		name
		buckets {
			docCount
			key
    	}
    }
}`

const GQL_DOCUMENT_TYPES = `queryDocumentTypes {
	hits {
		_id
		_name
		properties {
			active
			enabled
			fulltext
			name
			nGram
			valueType
		}
	}
}`;

const GQL_FIELDS = `queryFields(
	includeSystemFields: true
) {
	hits {
		_id
		key
		enabled
	} # hits
}`;

const GQL_INTERFACES = `queryInterfaces(
	count: -1
) {
	hits {
		_id
		_name
		collectionIds
		fields {
			boost
			name
		}
		stopWords
		synonymIds
	}
	total # limited without licence
}`;

const GQL_STOP_WORDS = `queryStopWords {
	hits {
		_id
		_name
	}
}`;

const GQL_THESAURI = `queryThesauri {
	hits {
		_id
		_name
	}
}`;

const GQL_ALL = `{
	${GQL_COLLECTIONS}
	${GQL_DOCUMENTS}
	${GQL_DOCUMENT_TYPES}
	${GQL_FIELDS}
	${GQL_INTERFACES}
	${GQL_STOP_WORDS}
	${GQL_THESAURI}
}`;
//console.debug('GQL_ALL', GQL_ALL);


export function useInterfacesState({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	//const [boolIsLoadingGraphQL, setboolIsLoadingGraphQL] = React.useState(false);
	//const [boolIsLoadingService, setboolIsLoadingService] = React.useState(false);
	//const [boolIsLoadingAnything, setboolIsLoadingAnything] = React.useState(false);

	const [collections, setCollections] = React.useState<Array<Collection>>([]);
	const [collectionIdToFieldKeys, setCollectionIdToFieldKeys] = React.useState({});
	const [globalFieldsObj/*, setGlobalFieldsObj*/] = React.useState({
		'_allText': true // TODO: Hardcode
	});
	const [interfaces, setInterfaces] = React.useState([]);
	const [interfaceNamesObj, setInterfaceNamesObj] = React.useState({} as InterfaceNamesObj);
	const [interfacesTotal, setInterfacesTotal] = React.useState(0);
	const [stopWordOptions, setStopWordOptions] = React.useState([]);
	const [thesauriOptions, setThesauriOptions] = React.useState([]);

	const [showCollectionCount/*, setShowCollectionCount*/] = React.useState(true);
	const [showCollections, setShowCollections] = React.useState(false);
	const [showFields, setShowFields] = React.useState(false);
	const [showSynonyms, setShowSynonyms] = React.useState(false);
	const [showStopWords, setShowStopWords] = React.useState(false);
	const [showDelete, setShowDelete] = React.useState(false);

	const memoizedUpdateInterfacesCallback = React.useCallback(() => {
		//setboolIsLoadingGraphQL(true);
		//setboolIsLoadingService(true);

		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_ALL
			})
		})
			.then(response => response.json())
			.then(json => {
				const data = json.data as {
					queryCollections :{
						hits :Array<{
							_id :string
							_name :string
							documentTypeId :string
						}>
					}
					queryDocuments :{
						aggregations :Array<{
							name :'collections'//string
							buckets :Array<{
								key :string
								docCount :number
							}>
						}>
					}
					queryDocumentTypes :{
						hits :Array<{
							_id :string
							_name :string
							properties :Array<{
								active :boolean
								enabled :boolean
								fulltext :boolean
								includeInAllText :boolean
								max :number
								min :number
								name :string
								nGram :boolean
								path :boolean
								valueType :string // TODO?
							}>
						}>
					}
					queryInterfaces :{
						hits :Array<{
							_id :string
							_name :string
							collectionIds :Array<string>
							fields :Array<{
								boost :number
								name :string
							}>
							stopWords :Array<string>
							synonymIds :Array<string>
						}>
						total :number
					}
					queryStopWords :{
						hits :Array<{
							_name :string
						}>
					}
					queryThesauri :{
						hits :Array<{
							_id :string
							_name :string
						}>
					}
				};
				//console.debug('data', data);

				//const fieldIdToKey = {};
				/*const newGlobalFieldsObj = {
					'_allText': true
				};
				data.queryFields.hits.forEach(({_id, key}) => {
					if (_id) { // This avoids undefined, on system_fields...
						//fieldIdToKey[_id] = key;
						newGlobalFieldsObj[key] = true;
					}
				});
				//console.debug('newGlobalFieldsObj', newGlobalFieldsObj);
				setGlobalFieldsObj(newGlobalFieldsObj);*/
				//console.debug('fieldIdToKey', fieldIdToKey);

				const collectionNameToDocCount = {};
				if (data.queryDocuments.aggregations && data.queryDocuments.aggregations.length) {
					for (let i = 0; i < data.queryDocuments.aggregations.length; i++) {
					    const aggregation = data.queryDocuments.aggregations[i];
						const {
							name,
							buckets
						} = aggregation;
						if (name === 'collections') {
							for (let i = 0; i < buckets.length; i++) {
							    const bucket = buckets[i];
								const {
									docCount,
									key
								} = bucket;
								collectionNameToDocCount[key] = docCount;
							} // for buckets
						} // if name === collections
					} // for aggregations
				} // if aggregations
				//console.debug('collectionNameToDocCount', collectionNameToDocCount);

				const documentTypeIdToFieldKeys :Record<string,Array<string>> = {};
				const documentTypeIdToFields :Record<string,Array<{
					active :boolean
					enabled :boolean
					fulltext :boolean
					includeInAllText :boolean
					max :number
					min :number
					name :string
					nGram :boolean
					path :boolean
					valueType :string // TODO?
				}>> = {};
				//const documentTypeIdToName :Record<string,string> = {};
				data.queryDocumentTypes.hits.forEach(({
					_id,
					//_name,
					properties = []
				}) => {
					const uniqueFieldsObj = {};
					properties.forEach(({
						/*active,
						enabled,
						fulltext,
						includeInAllText,
						max,
						min,*/
						name/*,
						nGram,
						path,
						valueType*/
					}) => {
						uniqueFieldsObj[name] = true;
					});
					documentTypeIdToFieldKeys[_id] = Object.keys(uniqueFieldsObj);
					documentTypeIdToFields[_id] = properties;
					//documentTypeIdToName[_id] = _name;
				});
				//console.debug('documentTypeIdToFieldKeys', documentTypeIdToFieldKeys);

				//const collectionIdToDocumentTypeIds = {};
				const collectionIdToFieldKeys = {};
				const collectionIdToName = {};
				const collections = []
				data.queryCollections.hits.forEach(({_id, _name, documentTypeId}) => {
					//collectionIdToDocumentTypeIds[_id] = documentTypeId;
					collectionIdToFieldKeys[_id] = documentTypeIdToFieldKeys[documentTypeId];
					collectionIdToName[_id] = _name;
					collections.push({
						_id,
						_name,
						documentTypeId,
						docCount: collectionNameToDocCount[_name] ? collectionNameToDocCount[_name] : 0
					});
				});
				setCollections(collections);
				//console.debug('collectionIdToDocumentTypeIds', collectionIdToDocumentTypeIds);
				//console.debug('collectionIdToFieldKeys', collectionIdToFieldKeys);
				setCollectionIdToFieldKeys(collectionIdToFieldKeys);
				//setCollectionIdToDocumentTypeIds(collectionIdToDocumentTypeIds);

				const thesaurusIdToName = {};
				setThesauriOptions(data.queryThesauri.hits.map(({
					_id, _name
				}) => {
					thesaurusIdToName[_id] = _name;
					return {
						key: _id,
						text: _name,
						value: _id
					};
				}));
				//console.debug('thesaurusIdToName', thesaurusIdToName);
				//setThesaurusIdToName(thesaurusIdToName);

				const interfacesObj = {};
				const interfaceNamesObj = {};
				data.queryInterfaces.hits.forEach(({
					_id,
					_name,
					collectionIds = [],
					fields = [], // boost, name
					stopWords = [],
					synonymIds = []
				}) => {
					interfaceNamesObj[_name] = true;
					/*const boostableFieldsObj = {
						'_allText': true // NOTE Hardcode
					};*/
					const collectionNamesObj = {};
					//const documentTypesAndFields = {};
					collectionIds.forEach((_id) => {
						/*const fieldKeys = collectionIdToFieldKeys[_id];
						if (fieldKeys) {
							fieldKeys.forEach((fieldKey) => {
								boostableFieldsObj[fieldKey] = true;
							});
						}*/
						/*const documentTypeId = collectionIdToDocumentTypeIds[_id];
						if (!documentTypesAndFields[documentTypeId]) {
							const documentTypeName = documentTypeIdToName[documentTypeId];
							documentTypesAndFields[documentTypeName] = documentTypeIdToFields[documentTypeId];
						}*/
						const collectionName = collectionIdToName[_id];
						if (collectionName) {
							collectionNamesObj[collectionName] = true;
						}
					});

					const thesaurusNames = [];
					synonymIds.forEach((thesaurusId) => {
						const thesaurusName = thesaurusIdToName[thesaurusId];
						if (thesaurusName) {
							thesaurusNames.push(thesaurusName);
						}
					});

					interfacesObj[_id] = {
						_id,
						_name,
						//boostableFieldKeys: Object.keys(boostableFieldsObj).sort(),
						collectionNames: Object.keys(collectionNamesObj).sort(),
						//documentTypesAndFields,
						fields,
						stopWords,
						thesaurusNames
					};
				});
				//console.debug('interfaces', interfaces);
				setInterfaceNamesObj(interfaceNamesObj);
				setInterfaces(
					Object.keys(interfacesObj)
						.map((_id) => interfacesObj[_id])
						.sort((a,b) => (a._name > b._name) ? 1 : -1)
				);
				setInterfacesTotal(data.queryInterfaces.total);

				setStopWordOptions(data.queryStopWords.hits.map(({
					//_id,
					_name
				}) => ({
					key: _name, // TODO _id
					text: _name,
					value: _name // TODO _id
				})));
				//setboolIsLoadingGraphQL(false);
			});
	}, [servicesBaseUrl]);

	React.useEffect(() => {
		memoizedUpdateInterfacesCallback();
	}, [memoizedUpdateInterfacesCallback]);

	/*React.useEffect(() => {
		setboolIsLoadingAnything(boolIsLoadingGraphQL || boolIsLoadingService);
	}, [boolIsLoadingGraphQL, boolIsLoadingService]);*/

	/*console.debug(
		'boolIsLoadingGraphQL', boolIsLoadingGraphQL,
		'boolIsLoadingService', boolIsLoadingService,
		'boolIsLoadingAnything', boolIsLoadingAnything
	);*/

	const collectionIdToName = {};
	const collectionOptions = collections.map(({
		_id,
		_name,
		docCount = 0
	}) => {
		collectionIdToName[_id] = _name;
		return {
			key: _id,
			text: `${_name} (${docCount})`,
			value: _id
		};
	});
	//console.debug('collectionOptions', collectionOptions);

	return {
		collectionIdToFieldKeys,
		collectionOptions,
		interfaceNamesObj,
		interfaces,
		interfacesTotal,
		globalFieldsObj,
		memoizedUpdateInterfacesCallback,
		setShowCollections,
		setShowDelete,
		setShowFields,
		setShowStopWords,
		setShowSynonyms,
		showCollections,
		showCollectionCount,
		showDelete,
		showFields,
		showStopWords,
		showSynonyms,
		stopWordOptions,
		thesauriOptions
	};
}
