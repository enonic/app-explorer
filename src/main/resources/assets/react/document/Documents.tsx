import {
	ELLIPSIS,
	QUERY_OPERATOR_AND,
	QUERY_OPERATOR_OR,
	getIn,
	isString,
} from '@enonic/js-utils';
import ReactHtmlParser from 'react-html-parser';
import {Slider} from 'react-semantic-ui-range';
import {
	Breadcrumb,
	Button,
	Divider,
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
	FRAGMENT_SIZE_DEFAULT,
	POST_TAG,
	PRE_TAG,
	SELECTED_COLUMNS_DEFAULT,
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
		selectedColumns, persistSelectedColumns,
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
											selectedColumns,
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
															selectedColumns,
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
												selectedColumns,
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
												selectedColumns,
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
											persistSelectedColumns(newSelectedColumns);
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
										value={selectedColumns}
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
												selectedColumns,
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
								selectedColumns,
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
														selectedColumns,
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
														selectedColumns,
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
										selectedColumns,
										start,
									});
								}}
								size='small'/></Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
				: null
		}
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					{selectedColumns.map((columnName, i) => <Table.HeaderCell collapsing content={columnName} key={i}/>)}
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
						{selectedColumns.includes(COLUMN_NAME_COLLECTION)
							? <Table.Cell collapsing>
								{rest[FIELD_PATH_META].collection}
							</Table.Cell>
							: null
						}
						{selectedColumns.includes(COLUMN_NAME_DOCUMENT_TYPE)
							? <Table.Cell collapsing>
								{rest[FIELD_PATH_META].documentType}
							</Table.Cell>
							: null
						}
						{selectedColumns.includes(COLUMN_NAME_LANGUAGE)
							? <Table.Cell collapsing>
								{rest[FIELD_PATH_META].language}
							</Table.Cell>
							: null
						}
						{selectedColumns.includes(COLUMN_NAME_ID)
							? <Table.Cell collapsing>{_id}</Table.Cell>
							: null
						}
						{selectedColumns.includes(COLUMN_NAME_JSON)
							? <Table.Cell collapsing>
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
							</Table.Cell>
							: null
						}
						{
							selectedColumns.map((selectedColumnName, j) => {
								if (!SELECTED_COLUMNS_DEFAULT.includes(selectedColumnName)) {
									const htmlString = getHighlightedHtml({
										_highlight,
										fallback: getIn(parsedJson, selectedColumnName),
										fieldPath: selectedColumnName,
										fragmentSize,
									});
									// console.debug('htmlString', htmlString);
									return <Table.Cell
										collapsing
										key={`${i}.${j}`}
									>{ReactHtmlParser(htmlString)}</Table.Cell>;
								}
							}).filter(x=>x)
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
