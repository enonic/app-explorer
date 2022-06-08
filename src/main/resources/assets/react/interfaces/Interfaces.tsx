import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';


import {
	Button,
	Grid,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import {NewOrEditInterfaceModal} from './NewOrEditInterfaceModal';
import {CopyModal} from './CopyModal';
import {DeleteModal} from './DeleteModal';
import {SearchModal} from './SearchModal';
import {useInterfacesState} from './useInterfacesState';

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
	const {
		//collectionIdToFieldKeys,
		collectionOptions,
		durationSinceLastUpdate,
		//fieldOptions,
		//globalFieldsObj,
		interfaceNamesObj,
		interfaces,
		interfacesTotal,
		isLoading,
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
	} = useInterfacesState({
		servicesBaseUrl
	});
	return <>
		<Segment basic className='page'>
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
										label={"Show all fields"}
										checked={showCollections}
										onChange={(
											_event,
											{checked}
										) => {
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
				</Grid.Column>
				<Grid.Column floated='right' width={4}>
					<Button
						basic
						floated='right'
						color='blue'
						loading={isLoading}
						onClick={memoizedUpdateInterfacesCallback}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Header
			as='h1'
			content='Interfaces'
			disabled={isLoading}
		/>
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
				{interfaces.map((initialValues, index :number) => {
					const {
						_id,
						_name,
						collectionNames = [],
						//documentTypesAndFields,
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
								collectionOptions={collectionOptions}
								interfaceNamesObj={interfaceNamesObj/* Currently not allowed to edit _name anyway */}
								licenseValid={licenseValid}
								loading={isLoading}
								servicesBaseUrl={servicesBaseUrl}
								setLicensedTo={setLicensedTo}
								setLicenseValid={setLicenseValid}
								stopWordOptions={stopWordOptions}
								thesauriOptions={thesauriOptions}
								total={interfacesTotal}
							/>
						</Table.Cell>
						<Table.Cell collapsing disabled={isLoading}>{_name}</Table.Cell>
						{showCollectionCount ? <Table.Cell collapsing disabled={isLoading}>{_name === 'default' ? '∞' : collectionNames.length}</Table.Cell> : null}
						{showCollections ? <Table.Cell collapsing disabled={isLoading}>{_name === 'default' ? '∞' : collectionNames.join(', ')}</Table.Cell> : null}
						{showFields ? <Table.Cell collapsing disabled={isLoading}>{fields.map(({
							boost,
							//fieldId,
							name
						}) => `${name}${(boost && boost > 1) ? `^${boost}` : ''}`).join(', ')}</Table.Cell> : null}
						{showSynonyms ? <Table.Cell collapsing disabled={isLoading}>{thesaurusNames.join(', ')}</Table.Cell> : null}
						{showStopWords ? <Table.Cell collapsing disabled={isLoading}>{stopWords.join(', ')}</Table.Cell> : null}
						<Table.Cell collapsing>
							<Button.Group>
								<SearchModal
									interfaceName={_name}
									loading={isLoading}
									fields={fields}
								/>
								<CopyModal
									afterClose={memoizedUpdateInterfacesCallback}
									loading={isLoading}
									name={_name}
									servicesBaseUrl={servicesBaseUrl}
								/>
								{showDelete ? <DeleteModal
									afterClose={memoizedUpdateInterfacesCallback}
									_id={_id}
									_name={_name}
									disabled={_name === 'default'}
									loading={isLoading}
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
			interfaceNamesObj={interfaceNamesObj}
			licenseValid={licenseValid}
			loading={isLoading}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			stopWordOptions={stopWordOptions}
			thesauriOptions={thesauriOptions}
			total={interfacesTotal}
		/>
	</>;
} // function Interfaces
