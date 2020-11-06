//import getIn from 'get-value';
import {Button, Form, Header, Label, Table} from 'semantic-ui-react';

//import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {List} from 'semantic-ui-react-form/List';

import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';

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
						//field,
						highlight,
						join,
						lengthLimit,
						separator,
						//to,
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
									{highlight
										? <>
											<Form.Field><Label content='Highlight fragmenter:'/><Dropdown
												options={[{
													key: 'span',
													text: 'span',
													value: 'span'
												},{
													key: 'simple',
													text: 'simple',
													value: 'simple'
												}]}
												path={`${pathWithIndex}.highlightFragmenter`}
												placeholder='Select highlight fragmenter'
												search
												selection
											/></Form.Field>
											<Form.Field><Label content='Highlight number of fragments:'/><Input
												path={`${pathWithIndex}.highlightNumberOfFragments`}
												type='number'
											/></Form.Field>
											<Form.Field><Label content='Highlight Order:'/><Dropdown
												options={[{
													key: 'none',
													text: 'none',
													value: 'none'
												},{
													key: 'score',
													text: 'score',
													value: 'score'
												}]}
												path={`${pathWithIndex}.highlightOrder`}
												placeholder='Select highlight order'
												search
												selection
											/></Form.Field>
											<Form.Field><Label content='Highlight pre tag:'/><Input
												path={`${pathWithIndex}.highlightPreTag`}
											/></Form.Field>
											<Form.Field><Label content='Highlight post tag:'/><Input
												path={`${pathWithIndex}.highlightPostTag`}
											/></Form.Field>
										</>
										: null
									}

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
				</Table>;
			}}
		/>
	</>;
} // function ResultMappings
