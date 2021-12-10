import {
	Button,
	// Form,
	Icon,
	Popup,
	// Radio,
	Table
} from 'semantic-ui-react';
// import {getEnonicContext} from 'semantic-ui-react-form/Context';
//import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
//import {List} from 'semantic-ui-react-form/List';

// import {ButtonDelete} from '../components/ButtonDelete';
import {ButtonEdit} from '../components/ButtonEdit';
import {Checkmark} from '../components/Checkmark';
import {Span} from '../components/Span';
import {AddOrEditLocalFieldModal} from './AddOrEditLocalFieldModal';
import {RemoveFieldFromDocumentTypeModal} from './RemoveFieldFromDocumentTypeModal';

export const DocumentFieldList = ({
	documentTypeName,
	collectionsArr,
	interfacesArr,
	servicesBaseUrl,
	properties
}) => {

	const [addOrEditModalState, setAddOrEditModalState] = React.useState({
		open: false
	});
	const [removeModalState, setRemoveModalState] = React.useState({
		open: false
	});

	/** Properties index
	 * 	active,
		enabled,
		fulltext,
		includeInAllText,
		name: key,
		valueType: fieldType,
		max,
		min,
		nGram,
		path
	 */

	/*const headerCellStyle = {
		//padding: '.92857143em .6em' // compact='very'
	};*/
	const cellStyle = {
		//padding: '.4em .6em' // compact='very'
		paddingBottom: 3,
		paddingTop: 3
	};
	const popupStyle = {
		opacity: .85
	};

	return <>
		{properties.length
			? <Table className='fieldlist' celled compact='very' selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell collapsing textAlign='center'>Edit</Table.HeaderCell>
						<Table.HeaderCell>Field</Table.HeaderCell>
						<Table.HeaderCell>Value type</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>{
					properties.map(({
						active,
						enabled,
						fulltext,
						global = false,
						includeInAllText,
						index = null,
						name,
						valueType,
						max,
						min,
						nGram,
						path
					}, i) => <Table.Row className={active ? null : 'strikeout'} key={i}>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>
							<Button.Group>
								<Popup
									content={global ? `Override global field ${name}` : `Edit local field ${name}`}
									inverted
									style={popupStyle}
									trigger={<ButtonEdit onClick={() => setAddOrEditModalState({
										initialValues: {
											active,
											enabled,
											includeInAllText,
											index,
											fulltext,
											max,
											min,
											name,
											nGram,
											path,
											valueType
										},
										open: true
									})}/>}
								/>
							</Button.Group>
						</Table.Cell>
						<Table.Cell className={active ? '' : null} style={cellStyle}>
							<Span disabled={global}>{name}</Span>
							{global ? <Icon color='grey' name='globe' style={{
								float: 'right'
							}}/> : null}
						</Table.Cell>
						<Table.Cell style={cellStyle}><Span disabled={global}>{valueType}</Span></Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'><Span disabled={global}>{min === 0 ? null : min}</Span></Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'><Span disabled={global}>{max === 0 ? '∞' : max}</Span></Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>{<Checkmark disabled={global} checked={enabled} size='large'/>}</Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>{enabled ? <Checkmark disabled={global} checked={includeInAllText} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>{enabled ? <Checkmark disabled={global} checked={fulltext} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>{enabled ? <Checkmark disabled={global} checked={nGram} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing style={cellStyle} textAlign='center'>{enabled ? <Checkmark disabled={global} checked={path} size='large'/>: null}</Table.Cell>
					</Table.Row>)
				}</Table.Body>
			</Table> : null}
		<Popup
			content='Add local field'
			inverted
			style={popupStyle}
			trigger={<Button
				icon
				onClick={() => setAddOrEditModalState({
					open: true
				})}><Icon
					color='green'
					name='plus'
				/> Add local field</Button>}
		/>
		{addOrEditModalState.open /* This means the component internal state will be totally reset */
			? <AddOrEditLocalFieldModal
				globalFieldObj={{}}
				onClose={() => setAddOrEditModalState({open: false})}
				state={addOrEditModalState}
			/>
			: null}
		{removeModalState.open
			? <RemoveFieldFromDocumentTypeModal
				documentTypeName={documentTypeName}
				collectionsArr={collectionsArr}
				interfacesArr={interfacesArr}
				onClose={() => setRemoveModalState({open: false})}
				servicesBaseUrl={servicesBaseUrl}
				state={removeModalState}
			/>
			: null
		}
	</>;
};
