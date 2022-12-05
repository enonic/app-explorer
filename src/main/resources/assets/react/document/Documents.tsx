import {
	QUERY_OPERATOR_AND,
	QUERY_OPERATOR_OR,
	getIn
} from '@enonic/js-utils';
import {
	Button,
	Dropdown,
	Form,
	Header,
	Input,
	Modal,
	Radio,
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
	SELECTED_COLUMNS_DEFAULT,
	useDocumentsState
} from './useDocumentsState';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works
const FIELD_PATH_META = 'document_metadata';


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
		jsonModalState, setJsonModalState,
		operatorState, setOperatorState,
		query, setQuery,
		queryDocuments,
		selectedCollections, setSelectedCollections,
		selectedColumns, setSelectedColumns,
		selectedDocumentTypes, setSelectedDocumentTypes,
	} = useDocumentsState({
		servicesBaseUrl
	})
	return <>
		<Header as='h1' content='Documents'/>
		<Form>
			<Form.Group>
				<Input
					icon='search'
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
								query,
								operator: operatorState,
								selectedColumns
							});
						}
					}}
					value={query}
				/>
				<Form.Field>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
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
												query,
												operator: newOperator,
												selectedColumns
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
									operator: operatorState,
									query,
									selectedColumns
								});
							}}
							options={collectionOptions}
							search
							selection
							style={{marginTop:6}}
							value={selectedCollections}
						/>}
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
									operator: operatorState,
									query,
									selectedColumns
								});
							}}
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
								setSelectedColumns(newSelectedColumns);
								queryDocuments({
									collectionsFilter: selectedCollections,
									documentsTypesFilter: selectedDocumentTypes,
									operator: operatorState,
									query,
									selectedColumns: newSelectedColumns
								});
							}}
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
				</Form.Field>
			</Form.Group>
		</Form>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					{columnOptions
						.filter(({value}) => selectedColumns.includes(value as string))
						.map(({text},i) => <Table.HeaderCell collapsing content={text} key={i}/>)}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{documentsRes.hits.map(({
					_id,
					// _json,
					parsedJson,
					...rest
				}, i) => <Table.Row key={i}>
					{selectedColumns.includes(COLUMN_NAME_COLLECTION)
						? <Table.Cell collapsing>{rest[FIELD_PATH_META].collection}</Table.Cell>
						: null
					}
					{selectedColumns.includes(COLUMN_NAME_DOCUMENT_TYPE)
						? <Table.Cell collapsing>{rest[FIELD_PATH_META].documentType}</Table.Cell>
						: null
					}
					{selectedColumns.includes(COLUMN_NAME_LANGUAGE)
						? <Table.Cell collapsing>{rest[FIELD_PATH_META].language}</Table.Cell>
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
								return <Table.Cell collapsing key={`${i}.${j}`}>{getIn(parsedJson, selectedColumnName)}</Table.Cell>;
							}
						}).filter(x=>x)
					}
				</Table.Row>)}
			</Table.Body>
		</Table>
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
