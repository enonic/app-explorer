import type {DropdownItemProps} from 'semantic-ui-react/index.d';
import type {InterfaceField} from '/lib/explorer/types/index.d';


import {
	Button,
	Dropdown,
	//Form,
	Icon,
	Input,
	Table
} from 'semantic-ui-react';
//import {DEFAULT_INTERFACE_FIELDS} from '../../../constants';


export function FieldSelector(props :{
	// Required
	fieldOptions :Array<DropdownItemProps>
	setFields :(fields:Array<InterfaceField>) => void
	// Optional
	disabled ?:boolean
	value ?:Array<InterfaceField>
}) {
	const {
		disabled = false,
		fieldOptions = [],
		setFields,
		value: fieldsArray = []
	} = props;

	/*if(!(fieldsArray && Array.isArray(fieldsArray) && fieldsArray.length)) {
		return <Form.Button
			disabled={disabled}
			onClick={() => {
				setFields(DEFAULT_INTERFACE_FIELDS);
			}}
		><Icon color='green' name='plus'/> Add field(s)</Form.Button>;
	}*/

	const selectedFields = fieldsArray.map(({name}) => name);
	//console.debug('selectedFields', selectedFields);

	//console.debug('fieldOptions', fieldOptions);
	const fieldOptionsObj = {};
	const unSelectedFieldOptions = fieldOptions.filter((fieldOption) => {
		//console.debug('fieldOption', fieldOption);
		fieldOptionsObj[fieldOption['key']] = fieldOption;
		return !selectedFields.includes(fieldOption['key']);
	});
	//console.debug('fieldOptionsObj', fieldOptionsObj);
	//console.debug('unSelectedFieldOptions', unSelectedFieldOptions);

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
				{
					fieldsArray.map(({
						boost = 1,
						name = ''
					}, index) => {
						//console.debug('index', index, 'name', name, 'boost', boost);
						return <Table.Row key={index}>
							<Table.Cell>
								<Dropdown
									disabled={disabled}
									fluid
									options={fieldOptionsObj[name]
										? [fieldOptionsObj[name]].concat(unSelectedFieldOptions)
										: unSelectedFieldOptions
									}
									onChange={(_e,{value:newName}) => {
										//console.debug('newName', newName);
										const deref = JSON.parse(JSON.stringify(fieldsArray));
										deref[index] = {
											name: newName,
											boost
										}
										setFields(deref);
									}}
									placeholder='Please select a field'
									search
									selection
									value={name}
								/>
							</Table.Cell>
							<Table.Cell>
								{name
									? <Input
										disabled={disabled}
										fluid
										min={1}
										onChange={(_e,{value:newBoost}) => {
											//console.debug('newBoost', newBoost);
											const deref = JSON.parse(JSON.stringify(fieldsArray));
											deref[index] = {
												name,
												boost: newBoost
											}
											setFields(deref);
										}}
										type='number'
										value={boost}
									/>
									: null
								}
							</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group icon>
									<Button
										disabled={disabled}
										icon
										onClick={() => {
											const deref = JSON.parse(JSON.stringify(fieldsArray));
											deref.splice(index+1, 0, {
												name: '',
												boost: 1
											});
											setFields(deref);
										}}
										type='button'
										value={{name: '', boost: 1}}
									><Icon color='green' name='add'/></Button>
									<Button
										disabled={disabled || index + 1 >= fieldsArray.length}
										icon
										onClick={() => {
											const deref = JSON.parse(JSON.stringify(fieldsArray));
											const tmp = deref[index];
											deref[index] = deref[index + 1];
							        		deref[index + 1] = tmp;
											setFields(deref);
										}}
									><Icon color='blue' name='arrow down'/></Button>
									<Button
										disabled={disabled || index === 0}
										icon
										onClick={() => {
											const deref = JSON.parse(JSON.stringify(fieldsArray));
											const tmp = deref[index];
											deref[index] = deref[index - 1];
							        		deref[index - 1] = tmp;
											setFields(deref);
										}}
									><Icon color='blue' name='arrow up'/></Button>
									<Button
										disabled={disabled || fieldsArray.length === 1}
										icon
										onClick={() => {
											const deref = JSON.parse(JSON.stringify(fieldsArray));
											deref.splice(index, 1);
											setFields(deref);
										}}
										type='button'
									><Icon color='red' name='trash alternate outline'/></Button>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					}) // map
				}
			</Table.Body>
		</Table>
	</>;
}
