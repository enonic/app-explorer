import {
	ELLIPSIS,
	QUERY_OPERATOR_AND,
	QUERY_OPERATOR_OR,
	getIn,
	isString,
} from '@enonic/js-utils';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import ReactHtmlParser from 'react-html-parser';
import {Slider} from 'react-semantic-ui-range';
import {
	Breadcrumb,
	Button,
	Dropdown,
	Form,
	Grid,
	Header,
	Icon,
	Input,
	Modal,
	Pagination,
	Radio,
	Segment,
	Table,
} from 'semantic-ui-react';
import {TypedReactJson} from '../search/TypedReactJson';
import {HoverPopup} from '../components/HoverPopup';
import {
	COLUMN_NAME_COLLECTION,
	COLUMN_NAME_DOCUMENT_TYPE,
	COLUMN_NAME_LANGUAGE,
	COLUMN_NAME_ID,
	COLUMN_NAME_JSON,
	SELECTED_COLUMNS_DEFAULT
} from './constants';
import DragAndDropableHeaderCell from './DragAndDropableHeaderCell';
import {
	FRAGMENT_SIZE_DEFAULT,
	POST_TAG,
	PRE_TAG,
	useDocumentsState
} from './useDocumentsState';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works


const FIELD_PATH_META = 'document_metadata';


function getHighlightedHtml({
	_highlight,
	fallback = '',
	fieldPath,
	fragmentSize,
}: {
	_highlight: Record<string,string[]>
	fallback: string
	fieldPath: string
	fragmentSize: number
}) {
	const lcFieldPath = fieldPath.toLowerCase();
	let highlightedHtml = _highlight[lcFieldPath]
		? _highlight[lcFieldPath][0]
		: _highlight[`${lcFieldPath}._stemmed_en`] // TODO Hardcode
			? _highlight[`${lcFieldPath}._stemmed_en`][0]
			: _highlight[`${lcFieldPath}._stemmed_no`]
				? _highlight[`${lcFieldPath}._stemmed_no`][0]
				: isString(fallback)
					? fallback.length > fragmentSize
						? `${fallback.substring(0, fragmentSize)}${ELLIPSIS}`
						: fallback
					: fallback;
	const strippedHighlight = highlightedHtml.replace(new RegExp(PRE_TAG,'g'), '').replace(new RegExp(POST_TAG,'g'), '');
	if (
		strippedHighlight !== fallback
	) {
		const startOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(0, strippedHighlight.length);
		const endOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(fallback.length - strippedHighlight.length);
		// console.debug({
		// 	fallback,
		// 	'fallback.length': fallback.length,
		// 	fragmentSize,
		// 	highlightedHtml,
		// 	strippedHighlight,
		// 	'strippedHighlight.length': strippedHighlight.length,
		// 	startOfFieldWithSameLengthAsStrippedHighlight,
		// 	endOfFieldWithSameLengthAsStrippedHighlight,
		// });
		if (strippedHighlight === startOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${highlightedHtml}${ELLIPSIS}`;
		} else if (strippedHighlight === endOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}`;
		} else {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}${ELLIPSIS}`;
		}
	}
	return highlightedHtml;
}


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
	return <>
		<Header as='h1' content='Documents'/>
		<Grid style={{padding:'0 14'}}>
			<Grid.Row reversed='mobile'>
				<Grid.Column mobile={16} tablet={16} computer={11} style={{padding:0}}>
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
								<Table basic collapsing compact>
									<Table.Body>
										<Table.Row verticalAlign='middle'>
											<Table.Cell collapsing>
												<Radio
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
													toggle
													checked={operatorState === QUERY_OPERATOR_AND}
												/>
											</Table.Cell>
										</Table.Row>
									</Table.Body>
								</Table>
							</Form.Field>
							<Form.Field>
								<Table basic collapsing compact>
									<Table.Body>
										<Table.Row verticalAlign='middle'>
											<Table.Cell style={{width:103}}>
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
											</Table.Cell>
										</Table.Row>
									</Table.Body>
								</Table>

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
				</Grid.Column>
				<Grid.Column mobile={16} tablet={16} computer={5} style={{padding:0}}>
					<Button
						basic
						disabled={loading}
						floated='right'
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
				</Grid.Column>
			</Grid.Row>
		</Grid>
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
		<DndProvider backend={HTML5Backend}>
			<Table celled collapsing compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						{selectedColumnsState.map((columnName, i) => <DragAndDropableHeaderCell
							collapsing
							content={
								columnName === COLUMN_NAME_COLLECTION
									? 'Collection'
									: columnName === COLUMN_NAME_DOCUMENT_TYPE
										? 'Document type'
										: columnName === COLUMN_NAME_LANGUAGE
											? 'Language'
											: columnName === COLUMN_NAME_ID
												? 'Document ID'
												: columnName === COLUMN_NAME_JSON
													? 'Document'
													: columnName
							}
							id={columnName}
							index={i}
							key={`column-${columnName}`}
							onDrop={({
								fromId,
								toId
							}) => handleDroppedColumn({
								fromId,
								toId
							})}
						/>)}
						{/*columnOptions
							.filter(({value}) => selectedColumns.includes(value as string))
							.map(({text},i) => <Table.HeaderCell collapsing content={text} key={i}/>)*/}
						{searchedString ? <Table.HeaderCell collapsing content='_allText'/> : null}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{documentsRes.hits.map(({
						_highlight = {},
						_id,
						// _json,
						parsedJson,
						...rest
					}, i) => {
						return <Table.Row key={i}>
							{
								selectedColumnsState.map((selectedColumnName, j) => {
									const key = `${i}.${j}`;
									if (selectedColumnName === COLUMN_NAME_COLLECTION) {
										return <Table.Cell collapsing key={key}>
											{rest[FIELD_PATH_META].collection}
										</Table.Cell>;
									} else if (selectedColumnName === COLUMN_NAME_DOCUMENT_TYPE) {
										return <Table.Cell collapsing key={key}>
											{rest[FIELD_PATH_META].documentType}
										</Table.Cell>;
									} else if (selectedColumnName === COLUMN_NAME_LANGUAGE) {
										return <Table.Cell collapsing key={key}>
											{rest[FIELD_PATH_META].language}
										</Table.Cell>;
									} else if (selectedColumnName === COLUMN_NAME_ID) {
										return <Table.Cell collapsing key={key}>{_id}</Table.Cell>;
									} else if (selectedColumnName === COLUMN_NAME_JSON) {
										return <Table.Cell collapsing key={key}>
											<Button
												icon='code'
												onClick={() => {
													setJsonModalState({
														open: true,
														id: _id,
														parsedJson: parsedJson,
													})
												}}
											/>
										</Table.Cell>;
									} else if (!SELECTED_COLUMNS_DEFAULT.includes(selectedColumnName)) {
										const htmlString = getHighlightedHtml({
											_highlight,
											fallback: getIn(parsedJson, selectedColumnName),
											fieldPath: selectedColumnName,
											fragmentSize,
										});
										// console.debug('htmlString', htmlString);
										return <Table.Cell
											collapsing
											key={key}
										>{ReactHtmlParser(htmlString)}</Table.Cell>;
									} else {
										console.error('Unhandeled selectedColumnName', selectedColumnName);
										return <Table.Cell
											collapsing
											key={key}
										/>;
									}
								})
								// .filter(x => x) // Overcome error, not needed and can cause scewed index between headerCell and cell
							}
							{searchedString ? <Table.Cell collapsing>
								{_highlight['_alltext'] && _highlight['_alltext'].length
									? <ul style={{
										listStyleType: 'none',
										margin: 0,
										padding: 0
									}}>
										{_highlight['_alltext'].map((htmlString, j) => <li key={j}>
											{ReactHtmlParser(htmlString)}
										</li>)}
									</ul>
									: null}
							</Table.Cell> : null}
						</Table.Row>})}
				</Table.Body>
			</Table>
		</DndProvider>
		<Pagination
			disabled={loading || !documentsRes.total}
			pointing
			secondary
			size='mini'
			style={{
				marginBottom: 14,
				marginTop: 14
			}}

			activePage={page}
			boundaryRange={1}
			siblingRange={1}
			totalPages={Math.ceil(documentsRes.total / perPage)}

			ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
			firstItem={{content: <Icon name='angle double left' />, icon: true}}
			prevItem={{content: <Icon name='angle left' />, icon: true}}
			nextItem={{content: <Icon name='angle right' />, icon: true}}
			lastItem={{content: <Icon name='angle double right' />, icon: true}}

			onPageChange={handlePaginationChange}
		/>
		{documentsRes.total
			? <p className={loading ? 'disabled' : ''}>Displaying {(() => {
				const begin = start + 1;
				const end = Math.min(start + perPage, documentsRes.total);
				if (end === begin) {
					return begin;
				}
				return `${begin}-${end} of ${documentsRes.total}`;
			})()}</p>
			: null
		}
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
	</>;
}
