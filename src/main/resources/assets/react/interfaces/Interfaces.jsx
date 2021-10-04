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


/*const INTERFACES_GQL = `queryInterfaces {
	total
	count
	hits {
		_id
		_name
		#_nodeType
		_path
		displayName
	}
}`;*/

/*const ALL_GQL = `{
	${INTERFACES_GQL}
}`;*/


export function Interfaces({
	licenseValid,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
}) {
	const [state, setState] = React.useState({
		interfaceExists: false,
		interfaceTo: '',
		interfaces: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: false
	});

	const [showCollectionCount, setShowCollectionCount] = React.useState(true);
	const [showCollections, setShowCollections] = React.useState(false);
	const [showFields, setShowFields] = React.useState(false);
	const [showSynonyms, setShowSynonyms] = React.useState(false);
	const [showStopWords, setShowStopWords] = React.useState(false);
	const [showDelete, setShowDelete] = React.useState(false);

	const memoizedUpdateInterfacesCallback = React.useCallback(() => {
		setState((oldState) => {
			const deref = JSON.parse(JSON.stringify(oldState));
			deref.isLoading = true;
			return deref;
		});
		fetch(`${servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => setState((oldState) => {
				const deref = JSON.parse(JSON.stringify(oldState));
				deref.collectionOptions = data.collectionOptions;
				deref.collections = data.collections;
				deref.fieldsObj = data.fieldsObj;
				deref.interfaces = data.interfaces;
				deref.isLoading = false;
				deref.stopWordOptions = data.stopWordOptions;
				deref.synonyms = data.synonyms;
				deref.thesauriOptions = data.thesauriOptions;
				return deref;
			}));
	}, [servicesBaseUrl]);

	React.useEffect(() => {
		memoizedUpdateInterfacesCallback();
	}, [memoizedUpdateInterfacesCallback]);

	const {
		collectionOptions,
		fieldsObj,
		interfaces: {
			hits,
			total
		},
		stopWordOptions,
		thesauriOptions
	} = state;
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
						collections,
						displayName,
						fields,
						stopWords,
						synonyms
					} = initialValues;
					//console.debug({displayName, _name, index});
					return <Table.Row key={index}>
						<Table.Cell collapsing>
							<NewOrEditInterfaceModal
								collectionOptions={collectionOptions}
								displayName={displayName}
								fieldsObj={fieldsObj}
								id={_id}
								afterClose={() => memoizedUpdateInterfacesCallback()}
								licenseValid={licenseValid}
								servicesBaseUrl={servicesBaseUrl}
								setLicensedTo={setLicensedTo}
								setLicenseValid={setLicenseValid}
								stopWordOptions={stopWordOptions}
								thesauriOptions={thesauriOptions}
								total={total}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{displayName}</Table.Cell>
						{showCollectionCount ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collections.length}</Table.Cell> : null}
						{showCollections ? <Table.Cell collapsing>{_name === 'default' ? '∞' : collections.join(', ')}</Table.Cell> : null}
						{showFields ? <Table.Cell collapsing>{fields.map(({name, boost}) => `${name}^${boost}`).join(', ')}</Table.Cell> : null}
						{showSynonyms ? <Table.Cell collapsing>{synonyms.join(', ')}</Table.Cell> : null}
						{showStopWords ? <Table.Cell collapsing>{stopWords.join(', ')}</Table.Cell> : null}
						<Table.Cell collapsing>
							<Button.Group>
								<SearchModal
									interfaceName={_name}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<CopyModal
									name={_name}
									afterClose={memoizedUpdateInterfacesCallback}
									servicesBaseUrl={servicesBaseUrl}
								/>
								{showDelete ? <DeleteModal
									name={_name}
									disabled={_name === 'default'}
									afterClose={memoizedUpdateInterfacesCallback}
									servicesBaseUrl={servicesBaseUrl}
								/> : null}
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditInterfaceModal
			collectionOptions={collectionOptions}
			fieldsObj={fieldsObj}
			afterClose={memoizedUpdateInterfacesCallback}
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
