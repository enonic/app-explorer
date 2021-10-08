import {
	Button,
	Header,
	Label,
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
*/

const GQL_COLLECTIONS = `queryCollections(
	perPage: -1
) {
	hits {
		_id
		_name
	}
}`;

const GQL_FIELDS = `queryFields(
	includeSystemFields: true
) {
	count
	total
	hits {
		_id
		#_name
		#_nodeType
		#_path
		key
		denyDelete
		#description
		#fieldType
		inResults
		#max
		#min
		#indexConfig {
		#	decideByType
		#	enabled
		#	fulltext
		#	includeInAllText
		#	nGram
		#	path
		#} # indexConfig
		#decideByType
		enabled
		#fulltext
		#includeInAllText
		#nGram
		#path
	} # hits
}`;

const GQL_INTERFACES = `queryInterfaces(
	count: -1
) {
	#count
	hits {
		_id
		_name
		#_nodeType
		#_path
		#_versionKey
		collectionIds
		fields {
			boost
			fieldId
			#name
		}
		stopWordIds
		synonymIds
	}
	total
}`;

const GQL_ALL = `{
	${GQL_COLLECTIONS}
}`;
/*
${GQL_FIELDS}
${GQL_INTERFACES}
*/
//console.debug('GQL_ALL', GQL_ALL);

export function Interfaces({
	licenseValid,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
}) {
	//const [boolIsLoadingGraphQL, setboolIsLoadingGraphQL] = React.useState(false);
	//const [boolIsLoadingService, setboolIsLoadingService] = React.useState(false);
	//const [boolIsLoadingAnything, setboolIsLoadingAnything] = React.useState(false);

	const [collections, setCollections] = React.useState([]);

	const [state, setState] = React.useState({
		interfaceExists: false,
		interfaceTo: '',
		interfaces: {
			count: 0,
			hits: [],
			total: 0
		}
	});

	const [showCollectionCount, setShowCollectionCount] = React.useState(true);
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
				setCollections(data.queryCollections.hits);
				//setboolIsLoadingGraphQL(false);
			});

		fetch(`${servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => {
				setState((oldState) => {
					const deref = JSON.parse(JSON.stringify(oldState));
					//deref.collectionOptions = data.collectionOptions;
					//deref.collections = data.collections; // Never been used?
					deref.fieldsObj = data.fieldsObj;
					deref.interfaces = data.interfaces;
					deref.stopWordOptions = data.stopWordOptions;
					deref.synonyms = data.synonyms;
					deref.thesauriOptions = data.thesauriOptions;
					return deref;
				});
				//setboolIsLoadingService(false);
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

	const {
		//collectionOptions,
		fieldsObj,
		interfaces: {
			hits,
			total
		},
		stopWordOptions,
		thesauriOptions
	} = state;

	const interfaceNamesObj = {};
	hits.forEach(({_name}) => {
		interfaceNamesObj[_name] = true;
	});

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								checked={showCollectionCount}
								onChange={(ignored,{checked}) => {
									setShowCollectionCount(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show collection count</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showCollections}
								onChange={(ignored,{checked}) => {
									setShowCollections(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show collection(s)</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showFields}
								onChange={(ignored,{checked}) => {
									setShowFields(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show field(s)</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showSynonyms}
								onChange={(ignored,{checked}) => {
									setShowSynonyms(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show synonyms</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showStopWords}
								onChange={(ignored,{checked}) => {
									setShowStopWords(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show stopwords</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showDelete}
								onChange={(ignored,{checked}) => {
									setShowDelete(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show delete</Label>
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
				{hits.map((initialValues, index) => {
					const {
						_id,
						_name,
						collectionIds = [],
						fields,
						stopWords,
						//stopWordIds = [],
						synonyms
						//synonymIds = []
					} = initialValues;
					//console.debug({_name, index});
					return <Table.Row key={index}>
						<Table.Cell collapsing>
							<NewOrEditInterfaceModal
								_id={_id}
								_name={_name}
								afterClose={() => memoizedUpdateInterfacesCallback()}
								collectionOptions={collectionOptions}
								fieldsObj={fieldsObj}
								interfaceNamesObj={interfaceNamesObj/* Currently not allowed to edit _name anyway */}
								licenseValid={licenseValid}
								servicesBaseUrl={servicesBaseUrl}
								setLicensedTo={setLicensedTo}
								setLicenseValid={setLicenseValid}
								stopWordOptions={stopWordOptions}
								thesauriOptions={thesauriOptions}
								total={total}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						{showCollectionCount ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collectionIds.length}</Table.Cell> : null}
						{showCollections ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collectionIds.map((cI)=>collectionIdToName[cI]).join(', ')}</Table.Cell> : null}
						{showFields ? <Table.Cell collapsing>{fields.map(({
							boost,
							//fieldId,
							name
						}) => `${name}^${boost}`).join(', ')}</Table.Cell> : null}
						{showSynonyms ? <Table.Cell collapsing>{synonyms.join(', ')}</Table.Cell> : null}
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
			fieldsObj={fieldsObj}
			interfaceNamesObj={interfaceNamesObj}
			licenseValid={licenseValid}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			stopWordOptions={stopWordOptions}
			thesauriOptions={thesauriOptions}
			total={total}
		/>
	</>;
} // function Interfaces
