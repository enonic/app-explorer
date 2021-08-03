import getIn from 'get-value';
import {Button, Form, Icon, Table} from 'semantic-ui-react';
import {
	getEnonicContext,
	DeleteItemButton,
	Dropdown,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	SetValueButton
} from 'semantic-ui-react-form';

import {DEFAULT_INTERFACE_FIELDS} from '../../../constants';



export function FieldSelector(props) {
	const [context/*, dispatch*/] = getEnonicContext();
	const {
		disabled = false,
		fieldsObj,
		name = 'fields',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context.values, path)//,
		//...rest
	} = props;
	//console.debug('FieldSelector path', path, 'value', value);

	//console.debug('FieldSelector fieldsObj', fieldsObj);
	const fieldOptions = Object.keys(fieldsObj).map((f) => ({key: f, text: f, value: f}));

	// This should not be needed:
	if(!(value && Array.isArray(value) && value.length)) {
		return <Form.Field>
			<SetValueButton
				path={path}
				value={DEFAULT_INTERFACE_FIELDS}
			><Icon color='green' name='plus'/> Add field(s)</SetValueButton>
		</Form.Field>;
	}
	return <>
		<Table celled compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell disabled={disabled}>Name</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled}>Boost</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled}>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<List
					path={path}
					render={(fieldsArray) => fieldsArray.map((ignored, index) => {
						const key =`${path}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell>
								<Dropdown
									disabled={disabled}
									options={fieldOptions}
									path={`${key}.name`}
								/>
							</Table.Cell>
							<Table.Cell>
								<Input
									disabled={disabled}
									fluid
									parentPath={key}
									name='boost'
									type='number'
								/>
							</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group icon>
									<InsertButton
										disabled={disabled}
										index={index+1}
										path={path}
										value={{name: '', boost: 1}}
									/>
									<MoveDownButton
										disabled={disabled || index + 1 >= fieldsArray.length}
										index={index}
										path={path}
									/>
									<MoveUpButton
										disabled={disabled || index === 0}
										index={index}
										path={path}
									/>
									<DeleteItemButton
										disabled={disabled || fieldsArray.length === 1}
										index={index}
										path={path}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				/>
			</Table.Body>
		</Table>
	</>;
}
