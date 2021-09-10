import _ from 'lodash';
import {
	Button,
	Header,
	//Icon,
	Loader,
	Table
} from 'semantic-ui-react';

import {NewOrEditModal} from './fields/NewOrEditModal';
import {DeleteModal} from './fields/DeleteModal';


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
		isLoading: true
	});
	//console.debug('Fields', {props, state});

	const {
		column,
		direction,
		fieldsRes,
		isLoading
	} = state;

	function fetchFields() {
		setState(prev => ({
			...prev,
			isLoading: true
		}));
		fetch(`${servicesBaseUrl}/fieldList`)
			.then(response => response.json())
			.then(data => setState(prev => ({
				...prev,
				...data,
				isLoading: false
			})));
	} // fetchFields

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

	React.useEffect(() => fetchFields(), []);

	return <>
		<Header as='h2'>Fields</Header>
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
							<Table.HeaderCell
								onClick={handleSortGenerator('fieldType')}
								sorted={column === 'fieldType' ? direction : null}
							>Type</Table.HeaderCell>
							{/*<Table.HeaderCell
								onClick={handleSortGenerator('allowArray')}
								sorted={column === 'allowArray' ? direction : null}
							>Allow array</Table.HeaderCell>*/}
							<Table.HeaderCell
								onClick={handleSortGenerator('min')}
								sorted={column === 'min' ? direction : null}
							>Min</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('max')}
								sorted={column === 'max' ? direction : null}
							>Max</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{fieldsRes.hits.map(({
							allowArray = false,
							denyDelete = false,
							denyValues = false,
							fieldType = 'text',
							key,
							min = 0,
							max = 0,
							name,
							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
							path
						}, index) => {
							return <Table.Row key={`field[${index}]`}>
								<Table.Cell>
									<NewOrEditModal
										disabled={denyValues}
										field={name}
										initialValues={{
											allowArray,
											fieldType,
											key,
											min,
											max,
											instruction,
											decideByType,
											enabled,
											fulltext,
											includeInAllText,
											nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
											path
										}}
										onClose={fetchFields}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Table.Cell>
								<Table.Cell>{key}</Table.Cell>
								<Table.Cell>{fieldType === 'any' ? '*' : fieldType}</Table.Cell>
								{/*<Table.Cell>{allowArray ? <Icon color='green' name='checkmark'/> : <Icon color='red' name='x'/>}</Table.Cell>*/}
								<Table.Cell>{min === 0 ? '*' : min}</Table.Cell>
								<Table.Cell>{max === 0 ? '∞' : max}</Table.Cell>
								<Table.Cell>
									<Button.Group>
										<DeleteModal
											disabled={denyDelete}
											name={name}
											onClose={fetchFields}
											servicesBaseUrl={servicesBaseUrl}
										/>
									</Button.Group>
								</Table.Cell>
							</Table.Row>;
						})}
					</Table.Body>
				</Table>
				<NewOrEditModal
					onClose={fetchFields}
					servicesBaseUrl={servicesBaseUrl}
				/>
			</>
		}
	</>;
} // Fields
