import type {
	DropdownItemProps,
	TRANSITION_STATUSES as TransitionStatuses,
} from 'semantic-ui-react';
import type {TermQuery} from '/lib/explorer/types/Interface.d';
import type {
	FieldNameToValueTypes,
	FieldPathToValueOptions,
} from '../index.d';


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
	Segment,
	Table,
	Transition,
} from 'semantic-ui-react';
import {DeleteItemButton} from '../../components/DeleteItemButton';
import {InsertButton} from '../../components/InsertButton';
import {MoveDownButton} from '../../components/MoveDownButton';
import {MoveUpButton} from '../../components/MoveUpButton';
import {QUERY_VALUE_TYPE_OPTIONS} from '../useNewOrEditInterfaceState';


const DURATION_SEGMENT_HIDE = 250;
const DURATION_SEGMENT_SHOW = 500;


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
	fieldValueOptions,
	getFieldValues,
	isDefaultInterface,
	isLoading,
	termQueries,
	setFieldValueOptions,
	setTermButtonVisible,
	setTermQueries,
}: {
	disabled?: boolean
	fieldNameToValueTypesState: FieldNameToValueTypes
	fieldOptions: DropdownItemProps[]
	fieldValueOptions: FieldPathToValueOptions
	getFieldValues: (field: string) => void
	isLoading: boolean
	isDefaultInterface: boolean
	termQueries: TermQuery[]
	setFieldValueOptions: React.Dispatch<React.SetStateAction<FieldPathToValueOptions>>
	setTermButtonVisible: React.Dispatch<React.SetStateAction<boolean>>
	setTermQueries: React.Dispatch<React.SetStateAction<TermQuery[]>>
}) {
	return <Transition
		animation='fade down'
		duration={{
			hide: DURATION_SEGMENT_HIDE,
			show: DURATION_SEGMENT_SHOW
		}}
		onStart={(_null,{status} :{status: TransitionStatuses}) => {
			// console.debug('segment onStart', status);
			if (status === 'EXITING') {
				setTimeout(() => {
					setTermButtonVisible(true);
				}, DURATION_SEGMENT_HIDE);
			}
		}}
		visible={isSet(termQueries) ? !!termQueries.length : false}
	>
		<Segment basic style={{padding: 0}}>
			<Header
				as='h4'
				content='Terms'
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
							booleanValue,
							doubleValue,
							longValue,
							stringValue,
						}, index) => <Table.Row key={index}>
							<Table.Cell>
								<Dropdown
									disabled={disabled}
									fluid
									options={fieldOptions}
									onChange={(_e,{value:newField}: {value: string}) => {
										if (!fieldValueOptions[newField]) {
											getFieldValues(newField);
										}
										//console.debug('newName', newName);
										const deref = JSON.parse(JSON.stringify(termQueries));
										const newType = fieldNameToValueTypesState[newField] && fieldNameToValueTypesState[newField].length === 1
											? fieldNameToValueTypesState[newField][0] as TermQuery['type']
											: undefined;
										const newValue = changedValue({
											newType,
											oldType: type,
											oldValue: newType === VALUE_TYPE_BOOLEAN
												? booleanValue
												: newType === VALUE_TYPE_DOUBLE
													? doubleValue
													: newType === VALUE_TYPE_LONG
														? longValue
														: stringValue
										});
										deref[index] = {
											boost, // : isSet(boost) ? boost : 1,
											field: newField,
											type: newType,
											booleanValue: isSet(booleanValue)
												? booleanValue
												: newType === VALUE_TYPE_BOOLEAN
													? newValue
													: undefined,
											doubleValue: isSet(doubleValue)
												? doubleValue
												: newType === VALUE_TYPE_DOUBLE
													? newValue
													: undefined,
											longValue: isSet(longValue)
												? longValue
												: newType === VALUE_TYPE_LONG
													? newValue
													: undefined,
											stringValue: isSet(stringValue)
												? stringValue
												: newType === VALUE_TYPE_STRING
													? newValue
													: undefined,
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
												const newValue = changedValue({
													newType,
													oldType: type,
													oldValue: newType === VALUE_TYPE_BOOLEAN
														? booleanValue
														: newType === VALUE_TYPE_DOUBLE
															? doubleValue
															: newType === VALUE_TYPE_LONG
																? longValue
																: stringValue
												})
												deref[index] = {
													boost, // : isSet(boost) ? boost : 1,
													field,
													type: newType,
													booleanValue: isSet(booleanValue)
														? booleanValue
														: newType === VALUE_TYPE_BOOLEAN
															? newValue
															: undefined,
													doubleValue: isSet(doubleValue)
														? doubleValue
														: newType === VALUE_TYPE_DOUBLE
															? newValue
															: undefined,
													longValue: isSet(longValue)
														? longValue
														: newType === VALUE_TYPE_LONG
															? newValue
															: undefined,
													stringValue: isSet(stringValue)
														? stringValue
														: newType === VALUE_TYPE_STRING
															? newValue
															: undefined,
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
														booleanValue: newValue,
														doubleValue,
														longValue,
														stringValue,
													}
													setTermQueries(deref);
												}}
												checked={booleanValue}
											/>
											: type === VALUE_TYPE_STRING
												? <Dropdown
													allowAdditions
													disabled={disabled}
													fluid
													options={
														fieldValueOptions[field] || []
														// ? fieldValueOptions[field].map((text) => ({text, value: text}))
														// : []
													}
													onAddItem={(_e,{value: newValue}: {value: string}) => {
														// console.debug('onAddItem newValue', newValue);
														const options = fieldValueOptions[field] || [];
														if (!options.map(({value}) => value).includes(newValue)) {
															setFieldValueOptions(prev => {
																const deref = JSON.parse(JSON.stringify(prev)) as typeof prev;
																deref[field].push({
																	text: `${newValue} (unknown)`,
																	value: newValue
																})
																return deref;
															});
														}
													}}
													onChange={(_e,{value: newValue}: {value: string}) => {
														//console.debug('newValue', newValue);
														const deref = JSON.parse(JSON.stringify(termQueries)) as typeof termQueries;
														deref[index] = {
															boost, // : isSet(boost) ? boost : 1,
															field,
															type,
															booleanValue,
															doubleValue,
															longValue,
															stringValue: newValue
														}
														setTermQueries(deref);
													}}
													placeholder='Please select or input a value'
													search
													selection
													value={stringValue}
												/>
												: <Input
													disabled={disabled}
													fluid
													onChange={(_e,{value: newStringValue}: {value: string}) => {
														// console.debug('newStringValue', newStringValue);
														const deref = JSON.parse(JSON.stringify(termQueries));
														const newNumberValue = VALUE_TYPE_DOUBLE
															? parseFloat(newStringValue)
															: parseInt(newStringValue, 10)
														// console.debug('newNumberValue', newNumberValue);
														deref[index] = {
															boost: isSet(boost) ? boost : 1,
															field,
															type,
															booleanValue,
															doubleValue: type === VALUE_TYPE_DOUBLE ? newNumberValue : doubleValue,
															longValue: type === VALUE_TYPE_LONG ? newNumberValue : longValue,
															stringValue
														}
														setTermQueries(deref);
													}}
													step={
														type === VALUE_TYPE_DOUBLE
															? 0.1
															: type === VALUE_TYPE_LONG
																? 1
																: null
													}
													type={/*[
														VALUE_TYPE_DOUBLE,
														VALUE_TYPE_LONG
													].includes(type) ? */'number'/* : 'text'*/}
													value={type === VALUE_TYPE_DOUBLE ? doubleValue : longValue}
												/>
										: null
								}
							</Table.Cell>
							<Table.Cell>
								<Input
									disabled={disabled}
									fluid
									min={0.1}
									onChange={(_e,{value: newStringBoost}: {value: string}) => {
										// console.debug('newStringBoost', newStringBoost);
										const newNumberBoost = parseFloat(newStringBoost);
										// console.debug('newNumberBoost', newNumberBoost);
										const deref = JSON.parse(JSON.stringify(termQueries));
										deref[index] = {
											boost: newNumberBoost,
											field,
											type,
											booleanValue,
											doubleValue,
											longValue,
											stringValue,
										}
										setTermQueries(deref);
									}}
									step={0.1}
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
										disabled={disabled}
										index={index}
										setArrayFunction={setTermQueries}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>)
					}
				</Table.Body>
			</Table>
		</Segment>
	</Transition>;
}
