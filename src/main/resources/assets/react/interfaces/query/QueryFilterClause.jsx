import getIn from 'get-value';
import {Button, Form, Header, Icon, Popup, Table} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';

import {Dropdown} from '../../enonic/Dropdown';
import {Input} from '../../enonic/Input';
import {List} from '../../enonic/List';
import {DeleteItemButton} from '../../enonic/DeleteItemButton';
import {InsertButton} from '../../enonic/InsertButton';
import {MoveDownButton} from '../../enonic/MoveDownButton';
import {MoveUpButton} from '../../enonic/MoveUpButton';
import {SetValueButton} from '../../enonic/SetValueButton';

import {ucFirst} from '../../utils/ucFirst';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';
import {QueryFilterSelector} from './QueryFilterSelector';
import {QueryFieldSelector} from './QueryFieldSelector';


export function QueryFilterClause(props) {
	const [context, dispatch] = getEnonicContext();
	//console.debug('QueryFilterClause context', context);

	const {
		fieldsObj = {},
		id,
		parentPath,
		name = 'must',
		legend = ucFirst(name),
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context, `values.${path}`)
	} = props;
	//console.debug('QueryFilterClause fieldsObj', fieldsObj);
	//console.debug('QueryFilterClause id', id, 'name', name, 'path', path, 'value', value);
	if(!(value && Array.isArray(value) && value.length)) {
		return <Form.Field id={id}>
			<SetValueButton
				icon={false}
				path={path}
				value={[{
					filter: 'exists',
					params: {
						field: ''
					}
				}]}
			><Icon color='green' name='plus'/> Add {name} filter(s)</SetValueButton>
		</Form.Field>;
	}
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	//console.debug('QueryFilterClause fieldOptions', fieldOptions);
	return <List
		path={path}
		render={(filtersArray) => {
			//console.debug('QueryFilterClause filtersArray', filtersArray);
			return <>
				<Header content={legend}dividing id={id}/>
				<Table celled compact selectable singleLine striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Filter</Table.HeaderCell>
							<Table.HeaderCell>Field</Table.HeaderCell>
							<Table.HeaderCell>Values</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>{filtersArray.map((filterItem, index) => {
					//console.debug('QueryFilterClause filterItem', filterItem);
						const {
							filter,
							params: {
								field,
								values: fieldValues
							}
						} = filterItem;
						//console.debug('QueryFilterClause filter', filter, 'field', field, 'fieldValues', fieldValues, 'index', index);
						const key=`${path}.${index}`;
						const valuesPath = `${key}.params.values`;
						//console.debug('QueryFilterClause valuesPath', valuesPath);
						//console.debug('QueryFilterClause key', key);
						return <Table.Row key={key}>
							<Table.Cell>
								<QueryFilterSelector
									parentPath={key}
									value={filter}
								/>
							</Table.Cell>
							<Table.Cell>
								{['exists', 'hasValue', 'notExists'].includes(filter)
									&& <QueryFieldSelector
										fieldOptions={fieldOptions}
										parentPath={`${key}.params`}
									/>
								}
							</Table.Cell>
							<Table.Cell>
								{filter === 'hasValue' && field && fieldsObj[field] && fieldsObj[field].values && <Dropdown
									multiple={true}
									path={valuesPath}
									options={fieldObjToFieldArr(fieldsObj[field].values) || []}
									value={fieldValues}
								/>}
								{filter === 'ids' && <List
									path={valuesPath}
									render={(ids) => {
										//console.debug('QueryFilterClause ids', ids);
										return <Table celled compact selectable singleLine striped>
											<Table.Header>
												<Table.Row>
													<Table.HeaderCell>Id</Table.HeaderCell>
													<Table.HeaderCell>Actions</Table.HeaderCell>
												</Table.Row>
											</Table.Header>
											<Table.Body>{ids.map((idValue = '', idIndex) => {
												const idKey=`${valuesPath}.${idIndex}`;
												//console.debug('QueryFilterClause idKey', idKey);
												return <Table.Row key={idKey}>
													<Table.Cell>
														<Input
															fluid
															path={idKey}
															value={idValue}
														/>
													</Table.Cell>
													<Table.Cell>
														<Button.Group>
															<InsertButton
																path={valuesPath}
																index={idIndex}
																value={''}
															/>
															<MoveDownButton
																disabled={idIndex + 1 >= ids.length}
																path={valuesPath}
																index={idIndex}
															/>
															<MoveUpButton
																path={valuesPath}
																index={idIndex}
															/>
															<DeleteItemButton
																disabled={ids.length < 2}
																path={valuesPath}
																index={idIndex}
															/>
														</Button.Group>
													</Table.Cell>
												</Table.Row>;
											})}
											</Table.Body>
										</Table>
									}}
								/>}
							</Table.Cell>
							<Table.Cell>
								<Button.Group>
									<Popup
										content='Insert'
										inverted
										trigger={<InsertButton
											path={path}
											index={index}
											value={{
												filter: 'exists',
												params: {
													field: ''
												}
											}}
										/>}/>
									<Popup
										content='Move down'
										inverted
										trigger={<MoveDownButton
											disabled={index + 1 >= filtersArray.length}
											path={path}
											index={index}
										/>}/>
									<Popup
										content='Move up'
										inverted
										trigger={<MoveUpButton
											path={path}
											index={index}
										/>}/>
									<Popup
										content='Delete'
										inverted
										trigger={<DeleteItemButton
											path={path}
											index={index}
										/>}/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
					</Table.Body>
				</Table>
			<Popup
				content='Add'
				inverted
				trigger={<InsertButton
					path={path}
					index={filtersArray.length}
					value={{
						filter: 'exists',
						params: {
							field: ''
						}
					}}
				/>}/>
			</>;
		}}
	/>;
} // function QueryFilterClause
