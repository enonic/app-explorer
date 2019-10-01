//import getIn from 'get-value';
import {Button, Form, Header, Table} from 'semantic-ui-react';

//import {getEnonicContext} from '../enonic/Context';
import {Checkbox} from '../enonic/Checkbox';
import {Dropdown} from '../enonic/Dropdown';
import {Input} from '../enonic/Input';
import {List} from '../enonic/List';

import {DeleteItemButton} from '../enonic/DeleteItemButton';
import {InsertButton} from '../enonic/InsertButton';
import {MoveDownButton} from '../enonic/MoveDownButton';
import {MoveUpButton} from '../enonic/MoveUpButton';

import {fieldObjToFieldArr} from './query/fieldObjToFieldArr';


export function ResultMappings(props) {
	//const [context, dispatch] = getEnonicContext();
	const {
		fieldsObj,
		id,
		legend = null,
		name = 'resultMappings',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	return <>
		<Header dividing id={id}>{legend}</Header>
		<List
			path={path}
			render={(resultMappingsArray) => {
				return <Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Field</Table.HeaderCell>
							<Table.HeaderCell>To</Table.HeaderCell>
							<Table.HeaderCell>Type</Table.HeaderCell>
							<Table.HeaderCell>Options</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>{resultMappingsArray.map(({
						field,
						highlight,
						join,
						lengthLimit,
						separator,
						to,
						type
					}, index) => {
						//console.debug('ResultMappings field', field, 'to', to, 'type', type, 'join', join, 'separator', separator, 'highlight', highlight, 'lengthLimit', lengthLimit);
						const pathWithIndex = `${path}.${index}`;
						const typePath = `${pathWithIndex}.type`;
						return <Table.Row key={pathWithIndex}>
							<Table.Cell><Dropdown
								options={fieldOptions}
								path={`${pathWithIndex}.field`}
							/></Table.Cell>
							<Table.Cell><Input
								path={`${pathWithIndex}.to`}
							/></Table.Cell>
							<Table.Cell><Dropdown
								options={[{
									key: 'string',
									text: 'String',
									value: 'string'
								}, {
									key: 'tags',
									text: 'Tag(s)',
									value: 'tags'
								}]}
								path={typePath}
								value={type}
							/></Table.Cell>
							<Table.Cell>
								{type === 'string' && <>
									<Form.Field>
										<Checkbox
											label="Join if array?"
											path={`${pathWithIndex}.join`}
										/>
									</Form.Field>
									{join && <Form.Field><Input
										label='Separator'
										path={`${pathWithIndex}.separator`}
										placeholder='separator'
										value={separator}
									/></Form.Field>}
									<Form.Field><Checkbox
										label="Highlight?"
										path={`${pathWithIndex}.highlight`}
									/></Form.Field>
									<Form.Field><Input
										label="Limit length to"
										path={`${pathWithIndex}.lengthLimit`}
										value={lengthLimit}
										type='number'
									/></Form.Field>
								</>}
							</Table.Cell>
							<Table.Cell>
								<Button.Group>
									<InsertButton
										path={path}
										index={index+1}
										value={{
											field: '',
											highlight: false,
											join: true,
											lengthLimit: '',
											separator: ' ',
											to: '',
											type: 'string'
										}}
									/>
									<MoveDownButton
										disabled={index + 1 >= resultMappingsArray.length}
										path={path}
										index={index}
									/>
									<MoveUpButton
										path={path}
										index={index}
									/>
									<DeleteItemButton
										disabled={resultMappingsArray.length < 2}
										path={path}
										index={index}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>
			}}
		/>
	</>;
} // function ResultMappings
