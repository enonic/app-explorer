import {
	QUERY_OPERATOR_AND,
	QUERY_OPERATOR_OR,
} from '@enonic/js-utils';
import {Slider} from 'react-semantic-ui-range';
import {
	Breadcrumb,
	Button,
	Dropdown,
	Form,
	Header,
	Icon,
	Input,
	Modal,
	Radio,
	Segment,
	Table,
} from 'semantic-ui-react';
import Flex from '../components/Flex';
import {HoverPopup} from '../components/HoverPopup';
import {TypedReactJson} from '../search/TypedReactJson';
import {
	FRAGMENT_SIZE_DEFAULT,
	useDocumentsState
} from './useDocumentsState';
import DocumentsTable from './DocumentsTable';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works


// const FIELD_PATH_META = 'document_metadata';


export function Documents({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	const {
		collectionOptions, // setCollectionOptions,
		collectionsHoverOpen, setCollectionsHoverOpen,
		columnsHoverOpen, setColumnsHoverOpen,
		columnOptions, // setColumnOptions,
		documentsRes, // setDocumentsRes,
		documentTypeOptions, // setDocumentTypeOptions,
		documentTypesHoverOpen, setDocumentTypesHoverOpen,
		doing, // setDoing,
		durationSinceLastUpdate, // setDurationSinceLastUpdate,
		fragmentSize, setFragmentSize,
		handleDroppedColumn,
		handlePaginationChange,
		jsonModalState, setJsonModalState,
		loading, // setLoading,
		operatorState, setOperatorState,
		page, // setPage,
		perPage, setPerPage,
		perPageHoverOpen, setPerPageHoverOpen,
		query, setQuery,
		queryDocuments,
		searchedString, // setSearchedString,
		selectedCollections, setSelectedCollections,
		selectedColumnsState, setSelectedColumnsState,
		selectedDocumentTypes, setSelectedDocumentTypes,
		start, setStart,
	} = useDocumentsState({
		servicesBaseUrl
	})
	return <Flex
		justifyContent='center'>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-ma-widescreenExceptGutters-widescreenUp',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='hidden'
		>
			<Header as='h1' content='Documents'/>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
					<Form style={{margin:0}}>
						<Form.Group style={{margin:0}}>
							<Input
								icon
								disabled={loading}
								loading={loading}
								onChange={(
									_event :React.ChangeEvent<HTMLInputElement>,
									{value}
								) => {setQuery(value as string)}}
								onKeyUp={(event :{
									which :number
								}) => {
									//console.debug('onKeyUp event.which',event.which);
									if(event.which == 10 || event.which == 13) {
										//console.debug('onKeyUp searchString',searchString);
										queryDocuments({
											collectionsFilter: selectedCollections,
											documentsTypesFilter: selectedDocumentTypes,
											fragmentSize,
											query,
											operator: operatorState,
											perPage,
											selectedColumns: selectedColumnsState,
											start: 0 // Explicitly reset to 0 when query changes
										});
									}
								}}
								value={query}
							>
								<input style={{
									borderRadius: 19
								}}/>
								<Icon name='search'/>
							</Input>
							<Form.Field>
								<Segment style={{
									height: 38
								}}>
									<Radio
										checked={operatorState === QUERY_OPERATOR_AND}
										disabled={loading}
										label={operatorState}
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{checked}
										) => {
											// console.debug('checked', checked);
											const newOperator = checked ? QUERY_OPERATOR_AND : QUERY_OPERATOR_OR;
											setOperatorState(newOperator);
											queryDocuments({
												collectionsFilter: selectedCollections,
												documentsTypesFilter: selectedDocumentTypes,
												fragmentSize,
												query,
												operator: newOperator,
												perPage,
												selectedColumns: selectedColumnsState,
												start: 0 // Explicitly reset to 0 when operator changes
											});
										}}
										style={{
											top: '50%',
											transform: 'translate(0%, -50%)'
										}}
										toggle
									/>
								</Segment>
							</Form.Field>
							<Form.Field>
								<Segment style={{
									height: 38,
									width: 200
								}}>
									<div style={{
										position: 'relative',
										top: '50%',
										transform: 'translate(0%, -50%)'
									}}>
										<Slider
											color='blue'
											disabled={loading}
											inverted
											settings={{
												min: 10,
												max: 255,
												start: FRAGMENT_SIZE_DEFAULT,
												step: 1,
												onChange: (value: number) => setFragmentSize(value)
											}}

											value={fragmentSize}
										/>
									</div>
								</Segment>
								{/*<Table basic collapsing compact>
									<Table.Body>
										<Table.Row verticalAlign='middle'>
											<Table.Cell >

											</Table.Cell>
										</Table.Row>
									</Table.Body>
								</Table>*/}
							</Form.Field>
							<Form.Field>
								<HoverPopup
									content={<Dropdown
										clearable
										multiple
										name='collections'
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{value}
										) => {
											const newSelectedCollections = value as string[];
											setSelectedCollections(newSelectedCollections);
											queryDocuments({
												collectionsFilter: newSelectedCollections,
												documentsTypesFilter: selectedDocumentTypes,
												fragmentSize,
												operator: operatorState,
												perPage,
												query,
												selectedColumns: selectedColumnsState,
												start: 0 // Explicitly reset to 0 when collections changes
											});
										}}
										options={collectionOptions}
										search
										selection
										style={{marginTop:6}}
										value={selectedCollections}
									/>}
									disabled={loading}
									header='Collections'
									icon='database'
									open={collectionsHoverOpen}
									setOpen={setCollectionsHoverOpen}
								/>
								<HoverPopup
									content={<Dropdown
										clearable
										multiple
										name='documentTypes'
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{value}
										) => {
											const newSelectedDocumentTypes = value as string[];
											setSelectedDocumentTypes(newSelectedDocumentTypes);
											queryDocuments({
												collectionsFilter: selectedCollections,
												documentsTypesFilter: newSelectedDocumentTypes,
												fragmentSize,
												operator: operatorState,
												perPage,
												query,
												selectedColumns: selectedColumnsState,
												start: 0 // Explicitly reset to 0 when documentTypes changes
											});
										}}
										disabled={loading}
										options={documentTypeOptions}
										search
										selection
										style={{marginTop:6}}
										value={selectedDocumentTypes}
									/>}
									header='Document types'
									icon='file code'
									open={documentTypesHoverOpen}
									setOpen={setDocumentTypesHoverOpen}
								/>
								{/*<HoverPopup
									content={<Dropdown
										clearable
										multiple
										options={columnOptions}
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{value}
										) => {}}
										search
										selection
										style={{marginTop:6}}
										value={undefined}
									/>}
									disabled={loading}
									header='Languages'
									icon='language'
									open={false}
									setOpen={()=>{}}
								/>*/}
								<HoverPopup
									content={<Dropdown
										defaultValue={[]}
										multiple
										name='columns'
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{value}
										) => {
											const newSelectedColumns = value as string[];
											setSelectedColumnsState(newSelectedColumns);
											queryDocuments({
												collectionsFilter: selectedCollections,
												documentsTypesFilter: selectedDocumentTypes,
												fragmentSize,
												operator: operatorState,
												perPage,
												query,
												selectedColumns: newSelectedColumns,
												start // Keep start when columns changes
											});
										}}
										disabled={loading}
										options={columnOptions}
										search
										selection
										style={{marginTop:6}}
										value={selectedColumnsState}
									/>}
									header='Columns'
									icon='columns'
									open={columnsHoverOpen}
									setOpen={setColumnsHoverOpen}
								/>
								<HoverPopup
									content={<Dropdown
										name='perPage'
										onChange={(
											_event :React.ChangeEvent<HTMLInputElement>,
											{value: newPerPage}: {value: number}
										) => {
											setPerPage(newPerPage);
											if (start !== 0) {
												setStart(0); // Explicitly reset to 0 when perPage changes
											}
											queryDocuments({
												collectionsFilter: selectedCollections,
												documentsTypesFilter: selectedDocumentTypes,
												fragmentSize,
												operator: operatorState,
												perPage: newPerPage,
												query,
												selectedColumns: selectedColumnsState,
												start: 0 // Explicitly reset to 0 when perPage changes
											});
										}}
										disabled={loading}
										options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
										selection
										style={{marginTop:6}}
										value={perPage}
									/>}
									header='Per page'
									icon='resize vertical'
									open={perPageHoverOpen}
									setOpen={setPerPageHoverOpen}
								/>
							</Form.Field>
						</Form.Group>
					</Form>
				</Flex.Item>
				<Flex.Item>
					<Button
						basic
						disabled={loading}
						color='blue'
						onClick={() => {
							queryDocuments({
								collectionsFilter: selectedCollections,
								documentsTypesFilter: selectedDocumentTypes,
								fragmentSize,
								operator: operatorState,
								perPage,
								query,
								selectedColumns: selectedColumnsState,
								start,
							});
						}}>{doing
							? doing
							: <>
								<Icon className='refresh'/>Last updated: {durationSinceLastUpdate}
							</>
						}</Button>
				</Flex.Item>
			</Flex>
			{
				searchedString
					? <Segment basic>Searched for <b>{searchedString}</b> and found {documentsRes.total} matching documents.</Segment>
					: null
			}
			{
				selectedCollections.length || selectedDocumentTypes.length
					? <Table basic compact className='bls-n brs-n'>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing><Icon name='filter'/></Table.Cell>
								<Table.Cell>
									{(() => {
										const sections = [];
										for (let i = 0; i < selectedCollections.length; i++) {
											const collectionName = selectedCollections[i];
											sections.push({
												content: <Button
													className='translucent'
													compact
													content={collectionName}
													icon='database'
													onClick={() => {
														const newSelectedCollections = JSON.parse(JSON.stringify(selectedCollections)) as typeof selectedCollections;
														newSelectedCollections.splice(newSelectedCollections.indexOf(collectionName), 1);
														setSelectedCollections(newSelectedCollections);
														queryDocuments({
															collectionsFilter: newSelectedCollections,
															documentsTypesFilter: selectedDocumentTypes,
															fragmentSize,
															operator: operatorState,
															perPage,
															query,
															selectedColumns: selectedColumnsState,
															start,
														});
													}}
													size='small'/>,
												key: `collection-${collectionName}`
											});
										} // for
										for (let i = 0; i < selectedDocumentTypes.length; i++) {
											const documentTypeName = selectedDocumentTypes[i];
											sections.push({
												content: <Button
													className='translucent'
													compact
													content={documentTypeName}
													icon='code file'
													onClick={() => {
														const newSelectedDocumentTypes = JSON.parse(JSON.stringify(selectedDocumentTypes)) as typeof selectedDocumentTypes;
														newSelectedDocumentTypes.splice(newSelectedDocumentTypes.indexOf(documentTypeName), 1);
														setSelectedDocumentTypes(newSelectedDocumentTypes);
														queryDocuments({
															collectionsFilter: selectedDocumentTypes,
															documentsTypesFilter: newSelectedDocumentTypes,
															fragmentSize,
															operator: operatorState,
															perPage,
															query,
															selectedColumns: selectedColumnsState,
															start,
														});
													}}
													size='small'/>,
												key: `documentType-${documentTypeName}`
											});
										} // for
										return <Breadcrumb
											icon='right angle'
											sections={sections}
										/>;
									})()}
								</Table.Cell>
								<Table.Cell collapsing><Button
									className='translucent'
									compact
									icon='close'
									onClick={() => {
										setSelectedCollections([]);
										setSelectedDocumentTypes([]);
										queryDocuments({
											collectionsFilter: [],
											documentsTypesFilter: [],
											fragmentSize,
											operator: operatorState,
											perPage,
											query,
											selectedColumns: selectedColumnsState,
											start,
										});
									}}
									size='small'/></Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
					: null
			}
			<DocumentsTable
				documentsRes={documentsRes}
				fragmentSize={fragmentSize}
				handleDroppedColumn={handleDroppedColumn}
				handlePaginationChange={handlePaginationChange}
				loading={loading}
				page={page}
				perPage={perPage}
				searchedString={searchedString}
				selectedColumnsState={selectedColumnsState}
				setJsonModalState={setJsonModalState}
				start={start}
			/>
			<Modal
				open={jsonModalState.open}
				onClose={() => setJsonModalState({
					open: false,
					id: '',
					parsedJson: undefined,
				})}
			>
				<Modal.Header content={jsonModalState.id}/>
				<Modal.Content>
					{jsonModalState.parsedJson
						? <TypedReactJson
							enableClipboard={false}
							displayArrayKey={false}
							displayDataTypes={false}
							displayObjectSize={false}
							indentWidth={2}
							name={null}
							quotesOnKeys={false}
							sortKeys={true}
							src={jsonModalState.parsedJson}
						/>
						: null}
				</Modal.Content>
			</Modal>
		</Flex.Item>
	</Flex>;
}
