import type {FetchData} from 'graphql-hooks';
import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';
import type {QueryInterfacesResponseData} from '../components/useExplorerState';


import {
	Button,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import Flex from '../components/Flex';
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
	basename,
	fetchInterfaces,
	licenseValid,
	searchString = '', setSearchString,
	servicesBaseUrl,
	setBottomBarMessage,
	setBottomBarMessageHeader,
	setBottomBarVisible,
	setLicensedTo,
	setLicenseValid
} :{
	basename: string
	fetchInterfaces: FetchData<QueryInterfacesResponseData>
	licenseValid: boolean
	searchString?: string
	setSearchString: React.Dispatch<React.SetStateAction<string>>
	servicesBaseUrl: string
	setBottomBarMessage: React.Dispatch<React.SetStateAction<string>>
	setBottomBarMessageHeader: React.Dispatch<React.SetStateAction<string>>
	setBottomBarVisible: React.Dispatch<React.SetStateAction<boolean>>
	setLicensedTo: SetLicensedToFunction
	setLicenseValid: SetLicenseValidFunction
}) {
	const {
		//collectionIdToFieldKeys,
		collectionOptions,
		durationSinceLastUpdate,
		fieldNameToValueTypesState, // setFieldNameToValueTypesState,
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
		// showCollectionCount,
		showDelete,
		showFields,
		showStopWords,
		showSynonyms,
		stopWordOptions,
		thesauriOptions
	} = useInterfacesState({
		fetchInterfaces,
		servicesBaseUrl,
	});
	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='overlay'
		>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
					<Segment className='button-padding'>
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
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<Button
						basic
						color='blue'
						loading={isLoading}
						onClick={memoizedUpdateInterfacesCallback}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Flex.Item>
			</Flex>
			<Header
				as='h1'
				content='Interfaces'
				disabled={isLoading}
			/>
			<Table celled compact singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Edit</Table.HeaderCell>
						<Table.HeaderCell>Name</Table.HeaderCell>
						{/*showCollectionCount ? <Table.HeaderCell>Collection count</Table.HeaderCell> : null*/}
						{showCollections ? <Table.HeaderCell>Collection(s)</Table.HeaderCell> : null}
						{showFields ? <Table.HeaderCell>Boosting</Table.HeaderCell> : null}
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
						if (_name === 'default') {
							return null;
						}
						//console.debug({_name, index});
						return <Table.Row key={index}>
							<Table.Cell collapsing>
								<NewOrEditInterfaceModal
									_id={_id}
									_name={_name}
									afterClose={() => memoizedUpdateInterfacesCallback()}
									collectionOptions={collectionOptions}
									fieldNameToValueTypesState={fieldNameToValueTypesState}
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
							{/*showCollectionCount ? <Table.Cell collapsing disabled={isLoading}>{_name === 'default' ? '∞' : collectionNames.length}</Table.Cell> : null*/}
							{showCollections ? <Table.Cell collapsing disabled={isLoading}>{_name === 'default' ? '∞' : <ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>{collectionNames.map((c, i) => <li key={i} style={{marginBottom: 3}}>{c}</li>)}</ul>}</Table.Cell> : null}
							{showFields ? <Table.Cell collapsing disabled={isLoading}><ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>{fields.map(({
									boost,
									//fieldId,
									name
								}, i) => <li key={i} style={{marginBottom: 3}}>{`${name}${(boost && boost > 1) ? `^${boost}` : ''}`}</li>)}</ul></Table.Cell> : null}
							{showSynonyms ? <Table.Cell collapsing disabled={isLoading}><ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>{thesaurusNames.map((c, i) => <li key={i} style={{marginBottom: 3}}>{c}</li>)}</ul></Table.Cell> : null}
							{showStopWords ? <Table.Cell collapsing disabled={isLoading}><ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>{stopWords.map((c, i) => <li key={i} style={{marginBottom: 3}}>{c}</li>)}</ul></Table.Cell> : null}
							<Table.Cell collapsing>
								<Button.Group>
									<SearchModal
										basename={basename}
										interfaceName={_name}
										loading={isLoading}
										fields={fields}
										searchString={searchString} setSearchString={setSearchString}
										servicesBaseUrl={servicesBaseUrl}
										setBottomBarMessage={setBottomBarMessage}
										setBottomBarMessageHeader={setBottomBarMessageHeader}
										setBottomBarVisible={setBottomBarVisible}
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
					})
						.filter(x => x) // Remove the default interface
					}
				</Table.Body>
			</Table>
			<NewOrEditInterfaceModal
				afterClose={memoizedUpdateInterfacesCallback}
				collectionOptions={collectionOptions}
				fieldNameToValueTypesState={fieldNameToValueTypesState}
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
		</Flex.Item>
	</Flex>;
} // function Interfaces
