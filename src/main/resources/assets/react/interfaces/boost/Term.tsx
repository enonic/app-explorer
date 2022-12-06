import type {DropdownItemProps} from 'semantic-ui-react';
import type {FieldNameToValueTypes} from '../index.d';
import type {TermQuery} from '../useNewOrEditInterfaceState';


import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_LONG,
	VALUE_TYPE_STRING,
	isSet,
} from '@enonic/js-utils';
import {
	Button,
	Dropdown,
	Header,
	Input,
	Radio,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from '../../components/DeleteItemButton';
import {InsertButton} from '../../components/InsertButton';
import {MoveDownButton} from '../../components/MoveDownButton';
import {MoveUpButton} from '../../components/MoveUpButton';
import {QUERY_VALUE_TYPE_OPTIONS} from '../useNewOrEditInterfaceState';


function changedValue({
	newType,
	oldType,
	oldValue,
}: {
	newType: TermQuery['type']
	oldType: TermQuery['type']
	oldValue: unknown
}) {
	let newValue = undefined;
	if (newType !== oldType) {
		if (newType === VALUE_TYPE_BOOLEAN) {
			newValue = true;
		} else if (newType === VALUE_TYPE_DOUBLE) {
			if (oldType === VALUE_TYPE_LONG) {
				newValue = oldValue;
			} else {
				newValue = 1.0
			}
		} else if (newType === VALUE_TYPE_LONG) {
			newValue = 1
		} else if (newType === VALUE_TYPE_STRING) {
			newValue = '';
		} else {
			console.error('Unhandeled new type', newType);
		}
	}
	return newValue;
}


export function Term({
	disabled = false,
	fieldNameToValueTypesState,
	fieldOptions,
	isDefaultInterface,
	isLoading,
	termQueries,
	setTermQueries,
}: {
	disabled?: boolean
	fieldNameToValueTypesState: FieldNameToValueTypes
	fieldOptions: DropdownItemProps[]
	isLoading: boolean
	isDefaultInterface: boolean
	termQueries: TermQuery[]
	setTermQueries: React.Dispatch<React.SetStateAction<TermQuery[]>>
}) {
	if (!termQueries.length) {
		return <></>;
	}
	return <>
		<Header
			as='h4'
			content='Term'
			disabled={isLoading || isDefaultInterface}
			dividing
			id='term'
			size='small'
		/>
		<Table celled compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell disabled={disabled} width={5}>Field</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled} width={2}>Type</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled} width={5}>Value</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled} width={2}>Boost</Table.HeaderCell>
					<Table.HeaderCell disabled={disabled} width={2}>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{
					termQueries.map(({
						boost = 1,
						field,
						type,
						value,
					}, index) => <Table.Row key={index}>
						<Table.Cell>
							<Dropdown
								disabled={disabled}
								fluid
								options={fieldOptions}
								onChange={(_e,{value:newField}: {value: string}) => {
									//console.debug('newName', newName);
									const deref = JSON.parse(JSON.stringify(termQueries));
									const newType = fieldNameToValueTypesState[newField] && fieldNameToValueTypesState[newField].length === 1
										? fieldNameToValueTypesState[newField][0] as TermQuery['type']
										: undefined;
									deref[index] = {
										boost, // : isSet(boost) ? boost : 1,
										field: newField,
										type: newType,
										value: changedValue({
											newType,
											oldType: type,
											oldValue: value
										})
									}
									setTermQueries(deref);
								}}
								placeholder='Please select a field'
								search
								selection
								value={field}
							/>
						</Table.Cell>
						<Table.Cell>
							{
								field
									? <Dropdown
										disabled={disabled || (fieldNameToValueTypesState[field] && fieldNameToValueTypesState[field].length === 1)}
										fluid
										options={
											fieldNameToValueTypesState[field]
												? fieldNameToValueTypesState[field].map((text) => ({text, value: text}))
												: QUERY_VALUE_TYPE_OPTIONS
										}
										onChange={(_e,{value: newType}: {value: TermQuery['type']}) => {
											//console.debug('newName', newName);
											const deref = JSON.parse(JSON.stringify(termQueries)) as typeof termQueries;
											deref[index] = {
												boost, // : isSet(boost) ? boost : 1,
												field,
												type: newType,
												value: changedValue({
													newType,
													oldType: type,
													oldValue: value
												})
											}
											setTermQueries(deref);
										}}
										placeholder='Please select a type'
										search
										selection
										value={type}
									/>
									: null
							}
						</Table.Cell>
						<Table.Cell>
							{
								type
									? type === VALUE_TYPE_BOOLEAN
										? <Radio toggle
											disabled={disabled}
											onChange={(_e,{checked:newValue}) => {
												//console.debug('newBoost', newBoost);
												const deref = JSON.parse(JSON.stringify(termQueries));
												deref[index] = {
													boost,
													field,
													type,
													value: newValue
												}
												setTermQueries(deref);
											}}
											checked={value as boolean}
										/>
										: <Input
											disabled={disabled}
											fluid
											onChange={(_e,{value:newValue}) => {
												//console.debug('newBoost', newBoost);
												const deref = JSON.parse(JSON.stringify(termQueries));
												deref[index] = {
													boost: isSet(boost) ? boost : 1,
													field,
													type,
													value: newValue
												}
												setTermQueries(deref);
											}}
											placeholder={
												type === VALUE_TYPE_STRING
													? 'Please input a value'
													: null
											}
											step={
												type === VALUE_TYPE_DOUBLE
													? '0.1'
													: type === VALUE_TYPE_LONG
														? '1'
														: null
											}
											type={[
												VALUE_TYPE_DOUBLE,
												VALUE_TYPE_LONG
											].includes(type) ? 'number' : 'text'}
											value={value}
										/>
									: null
							}
						</Table.Cell>
						<Table.Cell>
							<Input
								disabled={disabled}
								fluid
								min={0.1}
								onChange={(_e,{value:newBoost}) => {
									//console.debug('newBoost', newBoost);
									const deref = JSON.parse(JSON.stringify(termQueries));
									deref[index] = {
										boost: newBoost,
										field,
										type,
										value
									}
									setTermQueries(deref);
								}}
								step='0.1'
								type='number'
								value={boost}
							/>
						</Table.Cell>
						<Table.Cell>
							<Button.Group icon>
								<InsertButton
									array={termQueries}
									insertAtIndex={index + 1}
									disabled={disabled}
									setArrayFunction={setTermQueries}
									valueToInsert={{
										// field: '',
										// boost: 1,
										// type: VALUE_TYPE_STRING,
										// value: ''
									}}
								/>
								<MoveDownButton
									array={termQueries}
									disabled={disabled || index + 1 >= termQueries.length}
									index={index}
									setArrayFunction={setTermQueries}
								/>
								<MoveUpButton
									array={termQueries}
									disabled={disabled || index === 0}
									index={index}
									setArrayFunction={setTermQueries}
								/>
								<DeleteItemButton
									array={termQueries}
									disabled={disabled || termQueries.length < 2}
									index={index}
									setArrayFunction={setTermQueries}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>)
				}
			</Table.Body>
		</Table>
	</>;
}
