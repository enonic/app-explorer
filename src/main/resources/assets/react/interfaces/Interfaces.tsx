import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';


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
		//fieldOptions,
		//globalFieldsObj,
		interfaceNamesObj,
		interfaces,
		interfacesTotal,
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
									fields={fields}
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
