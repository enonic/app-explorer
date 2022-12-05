import {getIn} from '@enonic/js-utils';
import {
	Button,
	Dropdown,
	Header,
	Modal,
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
		columnsHoverOpen, setColumnsHoverOpen,
		columnOptions, // setColumnOptions,
		documentsRes, // setDocumentsRes,
		jsonModalState, setJsonModalState,
		selectedColumns, setSelectedColumns,
	} = useDocumentsState({
		servicesBaseUrl
	})
	return <>
		<HoverPopup
			content={<Dropdown
				multiple
				options={columnOptions}
				onChange={(
					_event :React.ChangeEvent<HTMLInputElement>,
					{value}
				) => {/*setSelectedColumns(value as string[])*/}}
				search
				selection
				style={{marginTop:6}}
				value={undefined}
			/>}
			header='Collections'
			icon='database'
			open={false}
			setOpen={()=>{/*todo*/}}
		/>
		<HoverPopup
			content={<Dropdown
				multiple
				options={columnOptions}
				onChange={(
					_event :React.ChangeEvent<HTMLInputElement>,
					{value}
				) => {/*setSelectedColumns(value as string[])*/}}
				search
				selection
				style={{marginTop:6}}
				value={undefined}
			/>}
			header='Document types'
			icon='file code'
			open={false}
			setOpen={()=>{/*todo*/}}
		/>
		<HoverPopup
			content={<Dropdown
				multiple
				options={columnOptions}
				onChange={(
					_event :React.ChangeEvent<HTMLInputElement>,
					{value}
				) => {/*setSelectedColumns(value as string[])*/}}
				search
				selection
				style={{marginTop:6}}
				value={undefined}
			/>}
			header='Languages'
			icon='language'
			open={false}
			setOpen={()=>{/*todo*/}}
		/>
		<HoverPopup
			content={<Dropdown
				multiple
				options={columnOptions}
				onChange={(
					_event :React.ChangeEvent<HTMLInputElement>,
					{value}
				) => {setSelectedColumns(value as string[])}}
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
		<Header as='h1' content='Documents'/>
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
