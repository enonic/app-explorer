import {VALUE_TYPE_STRING} from '@enonic/js-utils';

import _ from 'lodash';
import {
	Button,
	Header,
	Icon,
	Label,
	Loader,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {NewOrEditModal} from './NewOrEditModal';
import {DeleteModal} from './DeleteModal';
import {fetchFields} from './fetchFields';


export function Fields(props) {
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
		showDeleteButton: false,
		showDescriptionColumn: false,
		showIndexConfigColumns: false,
		showOccurencesColumns: true,
		showSystemFields: false
	});
	//console.debug('Fields', {props, state});

	const {
		column,
		direction,
		fieldsRes,
		isLoading,
		showDeleteButton,
		showDescriptionColumn,
		showIndexConfigColumns,
		showOccurencesColumns,
		showSystemFields
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
				setState(prev => ({
					...prev,
					fieldsRes: data.queryFields,
					isLoading: false,
					showSystemFields: includeSystemFields
				}));
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields
			}
		});
	} // updateFields

	const handleSortGenerator = (clickedColumn) => () => {
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
								checked={showSystemFields}
								onChange={(ignored,{checked}) => {
									updateFields({includeSystemFields: checked});
								}}
								toggle
							/>
							<Label color='black' size='large'>Show system fields</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showDescriptionColumn}
								onChange={(ignored,{checked}) => {
									setState(prev => ({
										...prev,
										showDescriptionColumn: checked
									}));
								}}
								toggle
							/>
							<Label color='black' size='large'>Show description column</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showOccurencesColumns}
								onChange={(ignored,{checked}) => {
									setState(prev => ({
										...prev,
										showOccurencesColumns: checked
									}));
								}}
								toggle
							/>
							<Label color='black' size='large'>Show occurences columns</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showIndexConfigColumns}
								onChange={(ignored,{checked}) => {
									setState(prev => ({
										...prev,
										showIndexConfigColumns: checked
									}));
								}}
								toggle
							/>
							<Label color='black' size='large'>Show index config columns</Label>
						</Table.Cell>
						<Table.Cell collapsing>
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
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>Fields</Header>
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
							{showDescriptionColumn ? <Table.HeaderCell>Description</Table.HeaderCell> : null}
							<Table.HeaderCell
								onClick={handleSortGenerator('fieldType')}
								sorted={column === 'fieldType' ? direction : null}
							>Type</Table.HeaderCell>

							{showOccurencesColumns ? <>
								<Table.HeaderCell
									onClick={handleSortGenerator('min')}
									sorted={column === 'min' ? direction : null}
								>Min</Table.HeaderCell>
								<Table.HeaderCell
									onClick={handleSortGenerator('max')}
									sorted={column === 'max' ? direction : null}
								>Max</Table.HeaderCell>
							</>: null}

							{showIndexConfigColumns ? <>
								<Table.HeaderCell>Enabled</Table.HeaderCell>
								<Table.HeaderCell>Decide by type</Table.HeaderCell>
								<Table.HeaderCell>Fulltext</Table.HeaderCell>
								<Table.HeaderCell>Include in _allText</Table.HeaderCell>
								<Table.HeaderCell>nGram</Table.HeaderCell>
								<Table.HeaderCell>path</Table.HeaderCell>
							</> : null}

							{showDeleteButton ? <Table.HeaderCell>Actions</Table.HeaderCell> : null}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{fieldsRes.hits.map(({
							_id,
							_name,
							denyDelete = false,
							fieldType = VALUE_TYPE_STRING,
							key,

							description,
							min = 0,
							max = 0,

							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
							path
						}, index) => {
							//console.debug(`Fields key:${key} fulltext:`, fulltext);
							return <Table.Row disabled={denyDelete} key={`field[${index}]`}>
								<Table.Cell>
									<NewOrEditModal
										_id={_id}
										disabled={denyDelete}
										field={_name}
										initialValues={{
											fieldType,
											key,
											min,
											max,
											description,
											instruction,
											decideByType,
											enabled,
											fulltext,
											includeInAllText,
											nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
											path
										}}
										onClose={updateFields}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Table.Cell>

								<Table.Cell>{key}</Table.Cell>

								{showDescriptionColumn ? <Table.Cell>{description}</Table.Cell> : null}

								<Table.Cell>{fieldType === 'any' ? '*' : fieldType}</Table.Cell>

								{showOccurencesColumns ? <>
									<Table.Cell textAlign='center'>{min === 0 ? '*' : min}</Table.Cell>
									<Table.Cell textAlign='center'>{max === 0 ? '∞' : max}</Table.Cell>
								</>: null}

								{showIndexConfigColumns ? <>
									<Table.Cell textAlign='center'>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									<Table.Cell textAlign='center'>{decideByType ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									<Table.Cell textAlign='center'>{fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									<Table.Cell textAlign='center'>{includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									<Table.Cell textAlign='center'>{nGram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									<Table.Cell textAlign='center'>{path ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
								</> : null}

								{showDeleteButton ? <Table.Cell>
									<Button.Group>
										<DeleteModal
											disabled={denyDelete}
											_id={_id}
											_name={_name}
											onClose={updateFields}
											servicesBaseUrl={servicesBaseUrl}
										/>
									</Button.Group>
								</Table.Cell> : null}

							</Table.Row>;
						})}
					</Table.Body>
				</Table>
				<NewOrEditModal
					onClose={updateFields}
					servicesBaseUrl={servicesBaseUrl}
				/>
			</>
		}
	</>;
} // Fields
