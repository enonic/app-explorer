import type {QueryFieldsResult} from '../../../services/graphQL/fetchers/fetchFields';


import {VALUE_TYPE_STRING} from '@enonic/js-utils';

import _ from 'lodash';
import * as React from 'react';
import {
	Header,
	Icon,
	Loader,
	Message,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {NewOrEditModal} from './NewOrEditModal';
import {DeleteModal} from './DeleteModal';
import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';


export function Fields(props :{
	servicesBaseUrl :string
}) {
	const {
		servicesBaseUrl
	} = props;

	const [state, setState] = React.useState({
		column: 'key',
		direction: 'ascending',
		fieldsRes: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: true,
		showDeleteButton: true, //false,
		//showDescriptionColumn: false,
		showIndexConfigColumns: false,
		showOccurencesColumns: false,
		showSystemFields: false,
		usedFieldKeysObj: {}
	} as {
		column :string
		direction :'ascending'|'descending'
		fieldsRes :QueryFieldsResult
		isLoading :boolean
		showDeleteButton :boolean
		//showDescriptionColumn :boolean
		showIndexConfigColumns :boolean
		showOccurencesColumns :boolean
		showSystemFields :boolean
		usedFieldKeysObj :Record<string, boolean>
	});
	//console.debug('Fields', {props, state});
	const [showCollections, setShowCollections] = React.useState(false);
	const [showDocumentTypes, setShowDocumentTypes] = React.useState(false);

	const {
		column,
		direction,
		fieldsRes,
		isLoading,
		showDeleteButton,
		//showDescriptionColumn,
		showIndexConfigColumns,
		showOccurencesColumns,
		showSystemFields,
		usedFieldKeysObj
	} = state;
	//console.debug('Fields fieldsRes', fieldsRes);


	function updateFields({
		includeSystemFields = showSystemFields
	} = {}) {
		setState(prev => ({
			...prev,
			isLoading: true
		}));
		fetchFields({
			handleData: (data) => {
				const usedFieldKeysObj = {};
				data.queryFields.hits.forEach(({key}) => {
					usedFieldKeysObj[key] = true;
				});
				setState(prev => ({
					...prev,
					fieldsRes: data.queryFields,
					isLoading: false,
					showSystemFields: includeSystemFields,
					usedFieldKeysObj
				}));
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields
			}
		});
	} // updateFields

	const handleSortGenerator = (clickedColumn :string) => () => {
		const {
			fieldsRes,
			column,
			direction
		} = state;
		/*console.debug('handleSort', {
			clickedColumn,
			fieldsRes,
			column,
			direction
		});*/

		if (column !== clickedColumn) {
			fieldsRes.hits = _.sortBy(fieldsRes.hits, [clickedColumn]);
			setState(prev => ({
				...prev,
				column: clickedColumn,
				fieldsRes,
				direction: 'ascending'
			}));
			return;
		}

		fieldsRes.hits = fieldsRes.hits.reverse();
		setState(prev => ({
			...prev,
			fieldsRes,
			direction: direction === 'ascending' ? 'descending' : 'ascending'
		}));
	}; // handleSortGenerator

	React.useEffect(() => updateFields(), []);

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show system fields"}
								className='inverted'
								checked={showSystemFields}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									updateFields({includeSystemFields: checked});
								}}
								toggle
							/>
						</Table.Cell>
						{/*<Table.Cell collapsing>
							<Radio
								label={"Show description column"}
								className='inverted'
								checked={showDescriptionColumn}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									setState(prev => ({
										...prev,
										showDescriptionColumn: checked
									}));
								}}
								toggle
							/>
						</Table.Cell>*/}
						<Table.Cell collapsing>
							<Radio
								label={"Show occurences columns"}
								className='inverted'
								checked={showOccurencesColumns}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									setState(prev => ({
										...prev,
										showOccurencesColumns: checked
									}));
								}}
								toggle
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								label={"Show document types"}
								className='inverted'
								checked={showDocumentTypes}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									setShowDocumentTypes(checked);
								}}
								toggle
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								label={"Show collections"}
								className='inverted'
								checked={showCollections}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									setShowCollections(checked);
								}}
								toggle
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								label={"Show index config columns"}
								className='inverted'
								checked={showIndexConfigColumns}
								onChange={(
									//@ts-ignore
									event :React.ChangeEvent<HTMLInputElement>,
									{checked}
								) => {
									setState(prev => ({
										...prev,
										showIndexConfigColumns: checked
									}));
								}}
								toggle
							/>
						</Table.Cell>
						{/*<Table.Cell collapsing>
							<Radio
								checked={showDeleteButton}
								onChange={(ignored,{checked}) => {
									setState(prev => ({
										...prev,
										showDeleteButton: checked
									}));
								}}
								toggle
							/>
							<Label color='black' size='large'>Show delete button</Label>
						</Table.Cell>*/}
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>Global fields</Header>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled collapsing compact selectable sortable striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Edit</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('key')}
								sorted={column === 'key' ? direction : null}
							>Name</Table.HeaderCell>

							{/*showDescriptionColumn ? <Table.HeaderCell>Description</Table.HeaderCell> : null*/}

							<Table.HeaderCell
								onClick={handleSortGenerator('fieldType')}
								sorted={column === 'fieldType' ? direction : null}
							>Type</Table.HeaderCell>

							{showOccurencesColumns ? <>
								<Table.HeaderCell
									onClick={handleSortGenerator('min')}
									sorted={column === 'min' ? direction : null}
									textAlign='center'
								>Min</Table.HeaderCell>
								<Table.HeaderCell
									onClick={handleSortGenerator('max')}
									sorted={column === 'max' ? direction : null}
									textAlign='center'
								>Max</Table.HeaderCell>
							</>: null}

							{showIndexConfigColumns ? <>
								<Table.HeaderCell textAlign='center'>Enabled</Table.HeaderCell>
								<Table.HeaderCell textAlign='center'>Decide by type</Table.HeaderCell>
								<Table.HeaderCell textAlign='center'>Fulltext</Table.HeaderCell>
								<Table.HeaderCell textAlign='center'>Include in _allText</Table.HeaderCell>
								<Table.HeaderCell textAlign='center'>nGram</Table.HeaderCell>
								<Table.HeaderCell textAlign='center'>path</Table.HeaderCell>
							</> : null}

							{showDocumentTypes ? <Table.HeaderCell textAlign='center'>Used in document types</Table.HeaderCell> : null}
							{showCollections ? <Table.HeaderCell textAlign='center'>Used in fieldCollections</Table.HeaderCell> : null}
							<Table.HeaderCell textAlign='right'>Documents with field</Table.HeaderCell>

							{showDeleteButton ? <Table.HeaderCell textAlign='center'>Delete</Table.HeaderCell> : null}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{fieldsRes.hits.map(({
							_id,
							_name,
							_referencedBy: {
								//count,
								hits: documentTypesReferencingField//,
								//total
							},

							fieldType = VALUE_TYPE_STRING,
							key,

							//description,
							min = 0,
							max = 0,

							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
							path
						}, index) => {
							//console.debug(`Fields key:${key} documentTypesReferencingField:`, documentTypesReferencingField);
							const fieldDocumentTypes = [];
							const fieldCollections = [];
							let documentsWithFieldTotal = 0;
							documentTypesReferencingField.forEach(({
								_name,
								_nodeType,
								_referencedBy: {
									//count,
									hits: collectionsReferencingDocumentType//,
									//total
								}
							}) => {
								if (_nodeType === 'com.enonic.app.explorer:documentType' && !fieldDocumentTypes.includes(_name)) {
									fieldDocumentTypes.push(_name);
									collectionsReferencingDocumentType.forEach(({
										_name,
										_nodeType,
										_hasField: {
											total
										}
									}) => {
										if (_nodeType === 'com.enonic.app.explorer:collection' && !fieldCollections.includes(_name)) {
											fieldCollections.push(_name);
											documentsWithFieldTotal += total;
										}
									});
								}
							});
							//console.debug(`Fields key:${key} fieldDocumentTypes:`, fieldDocumentTypes);
							//console.debug(`Fields key:${key} fieldCollections:`, fieldCollections);
							//console.debug(`Fields key:${key} fulltext:`, fulltext);

							return <Table.Row key={`field[${index}]`}>
								<Table.Cell>
									<NewOrEditModal
										_id={_id}
										initialValues={{
											fieldType,
											key,
											min,
											max,
											//description,
											decideByType,
											enabled,
											fulltext,
											includeInAllText,
											nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
											path
										}}
										afterClose={updateFields}
										servicesBaseUrl={servicesBaseUrl}
										usedFieldKeysObj={{}/* Since key isn't editable, no need to check for unique name*/}
									/>
								</Table.Cell>

								<Table.Cell>{key}</Table.Cell>

								{/*showDescriptionColumn ? <Table.Cell>{description}</Table.Cell> : null*/}

								<Table.Cell>{fieldType === 'any' ? '*' : fieldType}</Table.Cell>

								{showOccurencesColumns ? <>
									<Table.Cell textAlign='center'>{min === 0 ? null : min}</Table.Cell>
									<Table.Cell textAlign='center'>{max === 0 ? '∞' : max}</Table.Cell>
								</>: null}

								{showIndexConfigColumns ? <>
									<Table.Cell textAlign='center'>{enabled
										? <Icon color='green' name='checkmark' size='large'/>
										: <Icon color='grey' name='x' size='large'/>}
									</Table.Cell>

									<Table.Cell textAlign='center'>{enabled
										? decideByType
											? <Icon color='green' name='checkmark' size='large'/>
											: <Icon color='grey' name='x' size='large'/>
										: null
									}</Table.Cell>

									<Table.Cell textAlign='center'>{enabled
										? fulltext
											? <Icon color='green' name='checkmark' size='large'/>
											: <Icon color='grey' name='x' size='large'/>
										: null
									}</Table.Cell>

									<Table.Cell textAlign='center'>{enabled
										? includeInAllText
											? <Icon color='green' name='checkmark' size='large'/>
											: <Icon color='grey' name='x' size='large'/>
										: null
									}</Table.Cell>

									<Table.Cell textAlign='center'>{enabled
										? nGram
											? <Icon color='green' name='checkmark' size='large'/>
											: <Icon color='grey' name='x' size='large'/>
										: null
									}</Table.Cell>

									<Table.Cell textAlign='center'>{enabled
										? path
											? <Icon color='green' name='checkmark' size='large'/>
											: <Icon color='grey' name='x' size='large'/>
										: null
									}</Table.Cell>

								</> : null}

								{showDocumentTypes ? <Table.Cell textAlign='center'>
									<ul style={{
										listStyleType: 'none',
										margin: 0,
										padding: 0
									}}>{fieldDocumentTypes
											.sort()
											.map((dT, i) => <li key={i}>{dT}</li>)
										}</ul>
								</Table.Cell> : null}

								{showCollections ? <Table.Cell textAlign='center'>
									<ul style={{
										listStyleType: 'none',
										margin: 0,
										padding: 0
									}}>{fieldCollections.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>
								</Table.Cell> : null}

								<Table.Cell textAlign='right'>{documentsWithFieldTotal === 0
									? null
									: documentsWithFieldTotal
								}</Table.Cell>

								{showDeleteButton ? <Table.Cell textAlign='center'>
									{<DeleteModal
										_id={_id}
										_name={_name}
										afterClose={updateFields}
										fieldCollections={fieldCollections}
										fieldDocumentTypes={fieldDocumentTypes}
										popupContent={<Message
											icon
											positive
										>
											<Icon name='question' />
											<Message.Content>{`Delete field ${_name}?`}</Message.Content>
										</Message>
										}
										servicesBaseUrl={servicesBaseUrl}
									/>}
								</Table.Cell> : null}

							</Table.Row>;
						})}
					</Table.Body>
				</Table>
				<NewOrEditModal
					afterClose={updateFields}
					servicesBaseUrl={servicesBaseUrl}
					usedFieldKeysObj={usedFieldKeysObj}
				/>
			</>
		}
	</>;
} // Fields
