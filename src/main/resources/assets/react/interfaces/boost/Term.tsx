import type {
	DropdownItemProps,
	TRANSITION_STATUSES as TransitionStatuses,
} from 'semantic-ui-react';
import type {TermQuery} from '/lib/explorer/types/Interface.d';
import type {
	GetFieldValuesParams,
	FieldNameToValueTypes,
	FieldPathToValueOptions,
} from '../index.d';


import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_LONG,
	VALUE_TYPE_STRING,
	getIn,
	isSet,
} from '@enonic/js-utils';
import * as gql from 'gql-query-builder';
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
	collectionIdsFromStorage,
	disabled = false,
	fieldNameToValueTypesState,
	fieldOptions,
	fieldValueOptions,
	getFieldValues,
	isDefaultInterface,
	isLoading,
	termQueries,
	servicesBaseUrl,
	setFieldValueOptions,
	setTermButtonVisible,
	setTermQueries,
}: {
	collectionIdsFromStorage: string[]
	disabled?: boolean
	fieldNameToValueTypesState: FieldNameToValueTypes
	fieldOptions: DropdownItemProps[]
	fieldValueOptions: FieldPathToValueOptions
	getFieldValues: (params: GetFieldValuesParams) => void
	isLoading: boolean
	isDefaultInterface: boolean
	termQueries: TermQuery[]
	servicesBaseUrl: string
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
											getFieldValues({
												collectionIds: collectionIdsFromStorage,
												field: newField
											});
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
													onSearchChange={(_syntEvent,{searchQuery}) => {
														fetch(`${servicesBaseUrl}/graphQL`, {
															method: 'POST',
															headers: {
																'Content-Type':	'application/json'
															},
															body: JSON.stringify(gql.query({
																operation: 'queryDocuments',
																variables: {
																	collectionIds: {
																		required: false,
																		list: true,
																		type: 'ID',
																		value: collectionIdsFromStorage
																	},
																	count: {
																		value: 100
																	},
																	query: {
																		required: true,
																		type: 'QueryDSL',
																		value: {
																			boolean: {
																				should: [{
																					fulltext: {
																						boost: 1.1,
																						fields: [field],
																						query: searchQuery
																					}
																				}, {
																					ngram: {
																						fields: [field],
																						query: searchQuery
																					  }
																				}]
																			}
																		}
																	}
																},
																fields: [
																	{
																		hits: [
																			'_json'
																		]
																	}
																],
															}))
														})
															.then(response => response.json())
															.then(obj => {
																// console.debug('search field', field, 'searchQuery', searchQuery, 'response obj', obj);
																const {hits} = obj.data.queryDocuments;
																const foundFieldValues: string[] = [];
																for (let index = 0; index < hits.length; index++) {
																	const {_json} = hits[index];
																	try {
																		const parsedJsonObj = JSON.parse(_json);
																		const fieldValue = getIn(parsedJsonObj, field);
																		if (fieldValue && !foundFieldValues.includes(fieldValue)) {
																			foundFieldValues.push(fieldValue);
																		}
																	} catch(e) {
																		console.warning('Unable to JSON parse:', _json);
																	}
																} // for
																// console.debug('foundFieldValues', foundFieldValues);
																setFieldValueOptions(prev => {
																	const deref = JSON.parse(JSON.stringify(prev)) as typeof prev;
																	if (deref[field]) {
																		// We already have some field value options for this field.
																		for (let i = 0; i < foundFieldValues.length; i++) {
																			const key = foundFieldValues[i];
																			let foundIndex = -1;
																			for (let j = 0; j < deref[field].length; j++) {
																				const {value: existingKey} = deref[field][j];
																				// Check all new values against old ones
																				if (key === existingKey) {
																					foundIndex = j;
																				}
																			}
																			if (foundIndex === -1) {
																				// Add missing values
																				deref[field].push({
																					text: key,
																					value: key
																				});
																			} else {
																				// Update docCount on existing values
																				deref[field][foundIndex].text = key;
																			}
																		}
																	} else {
																		// We don't have any field value options for this field yet
																		// So simply add all.
																		deref[field] = foundFieldValues.map((value) => ({
																			text: value,
																			value
																		}))
																	}
																	return deref;
																});
															})
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
