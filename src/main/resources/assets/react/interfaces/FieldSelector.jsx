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
	const collectionIds = getIn(context.values, 'collectionIds') || [];

	const {
		collectionIdToFieldKeys = {},
		disabled = false,
		globalFieldsObj = {
			'_allText': true // TODO Hardcode
		},
		name = 'fields',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context.values, path)//,
		//...rest
	} = props;
	//console.debug('globalFieldsObj', globalFieldsObj);
	//console.debug('FieldSelector path', path, 'value', value);

	const fieldKeysObj = {};
	Object.keys(globalFieldsObj).forEach((k) => {
		fieldKeysObj[k] = {
			icon: 'globe'/*,
			key: k,
			text: k,
			value: k*/
		};
	});
	//console.debug('fieldKeysObj', fieldKeysObj);

	collectionIds.forEach((collectionId) => {
		//console.debug('collectionId', collectionId);
		const collectionFieldKeys = collectionIdToFieldKeys[collectionId];
		//console.debug('collectionFieldKeys', collectionFieldKeys);
		if (collectionFieldKeys) {
			collectionFieldKeys.forEach((fieldKey) => {
				//console.debug('fieldKey', fieldKey);
				fieldKeysObj[fieldKey] = { // This should overwrite global fields
					icon: (fieldKeysObj[fieldKey]
						&& (
							fieldKeysObj[fieldKey].icon === 'globe'
							|| fieldKeysObj[fieldKey].icon === 'question'
						)
					)
						? 'question'
						: 'map marker alternate'/*,
					key: fieldKey,
					text: fieldKey,
					value: fieldKey*/
				};
			});
		}
	});
	//console.debug('fieldKeysObj', fieldKeysObj);

	const fieldOptions = Object.keys(fieldKeysObj).sort()
		.map((key) => ({
			icon: fieldKeysObj[key].icon,
			key,
			text: key,
			value: key
		}));
	//console.debug('fieldOptions', fieldOptions);

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
					render={(fieldsArray) => fieldsArray.map(({
						//boost,
						name
					}, index) => {
						const key =`${path}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell>
								<Dropdown
									disabled={disabled}
									fluid
									options={fieldOptions}
									path={`${key}.name`}
									placeholder='Please select a field'
									search
									selection
								/>
							</Table.Cell>
							<Table.Cell>
								{name
									? <Input
										disabled={disabled}
										fluid
										parentPath={key}
										name='boost'
										type='number'
									/>
									: null
								}
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
