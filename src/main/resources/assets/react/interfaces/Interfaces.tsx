import type {
	InterfaceNamesObj,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from './index.d';

import * as React from 'react';
import {
	Button,
	Header,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {NewOrEditInterfaceModal} from './NewOrEditInterfaceModal';
import {CopyModal} from './CopyModal';
import {DeleteModal} from './DeleteModal';
import {SearchModal} from './SearchModal';

/* NOTE
 A search administrator should be able to choose which fields are queried (and boost among the choosen fields).

 It should be possible to choose fields within the "schema" (interface -> collections -> documentTypes -> fields (both global and local))
 In addition it should be possible to choose the system field _allText.

 It should NOT be possible to use fields starting with underscore (except _allText)
 It should NOT be possible to use document_metadata fields?

 When you make a new interface and have not added a collection to it yet, there are no fields to select from.
 As soon as you add a collection, then we can populate the list of fields to select from.
 Thus we need to keep a list of all collectionId to fieldKeys (via documentType), so we can lookup when needed.
*/

const GQL_COLLECTIONS = `queryCollections(
	perPage: -1
) {
	hits {
		_id
		_name
		documentTypeId
	}
}`;

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
	${GQL_DOCUMENT_TYPES}
	${GQL_FIELDS}
	${GQL_INTERFACES}
	${GQL_STOP_WORDS}
	${GQL_THESAURI}
}`;
//console.debug('GQL_ALL', GQL_ALL);

export function Interfaces({
	licenseValid,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
} :{
	licenseValid :boolean
	servicesBaseUrl :string
	setLicensedTo :SetLicensedToFunction
	setLicenseValid :SetLicenseValidFunction
}) {
	//const [boolIsLoadingGraphQL, setboolIsLoadingGraphQL] = React.useState(false);
	//const [boolIsLoadingService, setboolIsLoadingService] = React.useState(false);
	//const [boolIsLoadingAnything, setboolIsLoadingAnything] = React.useState(false);

	const [collections, setCollections] = React.useState([]);
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
				const data = json.data;
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

				const documentTypeIdToFieldKeys = {};
				data.queryDocumentTypes.hits.forEach(({
					_id,
					properties = []
				}) => {
					const uniqueFieldsObj = {};
					properties.forEach(({name}) => {
						uniqueFieldsObj[name] = true;
					});
					documentTypeIdToFieldKeys[_id] = Object.keys(uniqueFieldsObj);
				});
				//console.debug('documentTypeIdToFieldKeys', documentTypeIdToFieldKeys);

				setCollections(data.queryCollections.hits);
				const collectionIdToDocumentTypeIds = {};
				const collectionIdToFieldKeys = {};
				const collectionIdToName = {};
				data.queryCollections.hits.forEach(({_id, _name, documentTypeId}) => {
					collectionIdToDocumentTypeIds[_id] = documentTypeId;
					collectionIdToFieldKeys[_id] = documentTypeIdToFieldKeys[documentTypeId];
					collectionIdToName[_id] = _name;
				});
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
					collectionIds.forEach((_id) => {
						/*const fieldKeys = collectionIdToFieldKeys[_id];
						if (fieldKeys) {
							fieldKeys.forEach((fieldKey) => {
								boostableFieldsObj[fieldKey] = true;
							});
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
	const collectionOptions = collections.map(({_id, _name}) => {
		collectionIdToName[_id] = _name;
		return {
			key: _id,
			text: _name,
			value: _id
		};
	});
	//console.debug('collectionOptions', collectionOptions);

	return <>
		<Segment basic style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show all fields"}
								checked={showCollections}
								onChange={(ignored,{checked}) => {
									// setShowCollectionCount(checked);
									setShowCollections(checked);
									setShowFields(checked);
									setShowSynonyms(checked);
									setShowStopWords(checked);
									setShowDelete(checked);
								}}
								toggle
							/>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1' content='Interfaces'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showCollectionCount ? <Table.HeaderCell>Collection count</Table.HeaderCell> : null}
					{showCollections ? <Table.HeaderCell>Collection(s)</Table.HeaderCell> : null}
					{showFields ? <Table.HeaderCell>Field(s)</Table.HeaderCell> : null}
					{showSynonyms ? <Table.HeaderCell>Synonyms</Table.HeaderCell> : null}
					{showStopWords ? <Table.HeaderCell>Stopwords</Table.HeaderCell> : null}
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{interfaces.map((initialValues, index) => {
					const {
						_id,
						_name,
						collectionNames = [],
						fields = [],
						stopWords = [],
						//stopWordIds = [],
						thesaurusNames = []
					} = initialValues;
					//console.debug({_name, index});
					return <Table.Row key={index}>
						<Table.Cell collapsing>
							<NewOrEditInterfaceModal
								_id={_id}
								_name={_name}
								afterClose={() => memoizedUpdateInterfacesCallback()}
								collectionIdToFieldKeys={collectionIdToFieldKeys}
								collectionOptions={collectionOptions}
								globalFieldsObj={globalFieldsObj}
								interfaceNamesObj={interfaceNamesObj/* Currently not allowed to edit _name anyway */}
								licenseValid={licenseValid}
								servicesBaseUrl={servicesBaseUrl}
								setLicensedTo={setLicensedTo}
								setLicenseValid={setLicenseValid}
								stopWordOptions={stopWordOptions}
								thesauriOptions={thesauriOptions}
								total={interfacesTotal}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						{showCollectionCount ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collectionNames.length}</Table.Cell> : null}
						{showCollections ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collectionNames.join(', ')}</Table.Cell> : null}
						{showFields ? <Table.Cell collapsing>{fields.map(({
							boost,
							//fieldId,
							name
						}) => `${name}^${boost}`).join(', ')}</Table.Cell> : null}
						{showSynonyms ? <Table.Cell collapsing>{thesaurusNames.join(', ')}</Table.Cell> : null}
						{showStopWords ? <Table.Cell collapsing>{stopWords.join(', ')}</Table.Cell> : null}
						<Table.Cell collapsing>
							<Button.Group>
								<SearchModal
									interfaceName={_name}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<CopyModal
									afterClose={memoizedUpdateInterfacesCallback}
									name={_name}
									servicesBaseUrl={servicesBaseUrl}
								/>
								{showDelete ? <DeleteModal
									afterClose={memoizedUpdateInterfacesCallback}
									_id={_id}
									_name={_name}
									disabled={_name === 'default'}
									servicesBaseUrl={servicesBaseUrl}
								/> : null}
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditInterfaceModal
			afterClose={memoizedUpdateInterfacesCallback}
			collectionOptions={collectionOptions}
			collectionIdToFieldKeys={collectionIdToFieldKeys}
			globalFieldsObj={globalFieldsObj}
			interfaceNamesObj={interfaceNamesObj}
			licenseValid={licenseValid}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			stopWordOptions={stopWordOptions}
			thesauriOptions={thesauriOptions}
			total={interfacesTotal}
		/>
	</>;
} // function Interfaces
