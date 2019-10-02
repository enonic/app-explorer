import _ from 'lodash';
import {
	Button, Header, Icon, Loader, Table
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
	} // handleSortGenerator

	React.useEffect(() => fetchFields(), []);

	return <>
		<Header as='h1'>Fields</Header>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled collapsing compact selectable singleLine sortable striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell
								onClick={handleSortGenerator('key')}
								sorted={column === 'key' ? direction : null}
							>Name</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('displayName')}
								sorted={column === 'displayName' ? direction : null}
							>Display name</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('fieldType')}
								sorted={column === 'fieldType' ? direction : null}
							>Type</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('values')}
								sorted={column === 'values' ? direction : null}
							>Values</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{fieldsRes.hits.map(({
							denyDelete = false,
							denyValues = false,
							displayName = '',
							fieldType = 'text',
							key,
							name,
							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
							path,
							valuesRes
						}, index) => {
							return <Table.Row key={`field[${index}]`}>
								<Table.Cell>{key}</Table.Cell>
								<Table.Cell>{displayName}</Table.Cell>
								<Table.Cell>{fieldType}</Table.Cell>
								<Table.Cell>{valuesRes.hits.map(({displayName})=>displayName).join(', ')}</Table.Cell>
								<Table.Cell>
									<Button.Group>
										<NewOrEditModal
											disabled={denyValues}
											field={name}
											initialValues={{
												displayName,
												fieldType,
												key,
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
