import {
	Button,
	Header,
	Modal,
	Table,
} from 'semantic-ui-react';
import {TypedReactJson} from '../search/TypedReactJson';
import {useDocumentsState} from './useDocumentsState';

// import {FIELD_PATH_META} from '/lib/explorer/constants'; // TODO setup build system so this import works
const FIELD_PATH_META = 'document_metadata';


export function Documents({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	const {
		documentsRes, // setDocumentsRes,
		jsonModalState, setJsonModalState,
	} = useDocumentsState({
		servicesBaseUrl
	})
	return <>
		<Header as='h1' content='Documents'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell collapsing>Document ID</Table.HeaderCell>
					<Table.HeaderCell collapsing>Collection</Table.HeaderCell>
					<Table.HeaderCell collapsing>Document type</Table.HeaderCell>
					<Table.HeaderCell collapsing>Language</Table.HeaderCell>
					<Table.HeaderCell collapsing>JSON</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{documentsRes.hits.map(({_id, _json, ...rest}, i) => <Table.Row key={i}>
					<Table.Cell collapsing>{_id}</Table.Cell>
					<Table.Cell collapsing>{rest[FIELD_PATH_META].collection}</Table.Cell>
					<Table.Cell collapsing>{rest[FIELD_PATH_META].documentType}</Table.Cell>
					<Table.Cell collapsing>{rest[FIELD_PATH_META].language}</Table.Cell>
					<Table.Cell collapsing>
						<Button
							icon='code'
							onClick={() => {
								setJsonModalState({
									open: true,
									id: _id,
									json: _json,
								})
							}}
						/>
					</Table.Cell>
				</Table.Row>)}
			</Table.Body>
		</Table>
		<Modal
			open={jsonModalState.open}
			onClose={() => setJsonModalState({
				open: false,
				id: '',
				json: '',
			})}
		>
			<Modal.Header content={jsonModalState.id}/>
			<Modal.Content>
				{jsonModalState.json
					? <TypedReactJson
						enableClipboard={false}
						displayArrayKey={false}
						displayDataTypes={false}
						displayObjectSize={false}
						indentWidth={2}
						name={null}
						quotesOnKeys={false}
						sortKeys={true}
						src={JSON.parse(jsonModalState.json)}
					/>
					: null}
			</Modal.Content>
		</Modal>
	</>;
}
