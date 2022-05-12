import type {DocumentTypeFields} from '/lib/explorer/types/index.d';
import type {
	AddOrEditLocalFieldModalState,
	UpdateOrDeletePropertiesFunction
} from './index.d';


import {
	INDEX_CONFIG_N_GRAM,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	fold,
	isSet
} from '@enonic/js-utils';
import * as React from 'react';
import {
	Button,
	Dropdown,
	Grid,
	Icon,
	Input,
	Message,
	Modal,
	Radio,
	Table
} from 'semantic-ui-react';

import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDocumentMetaData} from '../utils/notDocumentMetaData';
import {notDoubleDot} from '../utils/notDoubleDot';
import {onlyLowercaseAsciiLettersDigitsUnderscoresAndDots} from '../utils/onlyLowercaseAsciiLettersDigitsUnderscoresAndDots';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {required} from '../utils/required';


const OPTIONS_VALUE_TYPES = [
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
].map(key => ({
	key,
	text: key,
	value: key
}));


export const AddOrEditLocalFieldModal = ({
	properties,
	updateOrDeleteProperties,
	modalState: {
		open: openProp = false,
		state: {
			active: propActive = true,
			enabled: propEnabled = true,
			includeInAllText: propIncludeInAllText = true,
			index: propIndex = null,
			fulltext: propFulltext = true,
			max: propMax = 0,
			min: propMin = 0,
			name: propName = '',
			nGram: propNgram = true,
			path: propPath = false,
			valueType: propValueType = VALUE_TYPE_STRING
		}
	},
	onClose = () => { return },
} :{
	modalState :AddOrEditLocalFieldModalState
	properties :DocumentTypeFields
	updateOrDeleteProperties :UpdateOrDeletePropertiesFunction
	onClose ?:() => void
}) => {

	const usedNames = {};
	properties.forEach(({name}) => {
		usedNames[name] = true;
	});

	// WARNING: When reusing a single modal component,
	// component internal state default values are NOT reset when props change!
	const [enabled, setEnabled] = React.useState(propEnabled);
	const [fulltext, setFulltext] = React.useState(propFulltext);
	const [includeInAllText, setIncludeInAllText] = React.useState(propIncludeInAllText);
	const [max, setMax] = React.useState(propMax);
	const [min, setMin] = React.useState(propMin);
	const [name, setName] = React.useState(propName);
	const [nGram, setNgram] = React.useState(propNgram);
	const [path, setPath] = React.useState(propPath);
	const [valueType, setValueType] = React.useState(propValueType);
	const [active, setActive] = React.useState(propActive);

	const [nameTouched, setNameTouched] = React.useState(false);

	const [header, setHeader] = React.useState('');

	React.useEffect(() => {
		setHeader(propName || name ? `Edit field ${propName || name}` : `Add field`);
	}, [propName, name]);

	/*
	Since I'm doing {open ? <AddOrEditLocalFieldModal> : null} outside the
	component, the component internal state will be totally wiped onClose.
	Thus there is no need for the following code:
	React.useEffect(() => {
		//console.debug('Props changed, updating internal state');
		setEnabled(propEnabled);
		setFulltext(propFulltext);
		setIncludeInAllText(propIncludeInAllText);
		setMax(propMax);
		setMin(propMin);
		setName(propName);
		setNgram(propNgram);
		setPath(propPath);
		setValueType(propValueType);
		setNameTouched(false);
	}, [
		propEnabled,
		propFulltext,
		propIncludeInAllText,
		propMax,
		propMin,
		propName,
		propNgram,
		propPath,
		propValueType
	]);*/

	const errorMsg = propName
		? undefined
		: nameTouched
			? (
				required(name)
				|| mustStartWithALowercaseLetter(name)
				|| onlyLowercaseAsciiLettersDigitsUnderscoresAndDots(name)
				|| notDoubleUnderscore(name)
				|| notDoubleDot(name)
				|| notDocumentMetaData(name)
				|| (usedNames[name] ? `${name} already added, please input another name.` : '') // '' = falsy
			)
			: undefined;

	const msg =  errorMsg ? <Message
		content={errorMsg}
		icon='warning'
		negative
	/> : null;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={onClose}
		open={openProp}
		size='large' // small is too narrow
	>
		<Modal.Header as='h1' className='ui'>
			<Grid columns='equal'>
				<Grid.Row>
					<Grid.Column>
						{header}
					</Grid.Column>
					<Grid.Column floated='right'>
						<Radio
							className='editFieldActiveButton'
							label='Active'
							// labelPosition= {'right'}
							toggle
							onChange={()=>{
								setActive(!active);
							}}
							checked={active}>
						</Radio>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</Modal.Header>
		<Modal.Content>
			<Input
				disabled={propName ? true : false}
				fluid
				label='Name'
				onChange={(
					//@ts-ignore
					event,
					{value: newName}
				) => {
					setName(fold(newName.toLowerCase()));
					setNameTouched(true);
				}}
				placeholder='Please input a field name'
				defaultValue={name}
			/>
			{msg}
			<Table celled compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Value type</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell><Dropdown
							onChange={(
								//@ts-ignore
								event,
								{value: newValueType}: {value :string}
							) => {
								setValueType(newValueType);
							}}
							options={OPTIONS_VALUE_TYPES}
							search
							selection
							value={valueType}
						/></Table.Cell>
						<Table.Cell collapsing><Input
							min={0}
							onChange={(
								//@ts-ignore
								event,
								{value: newMinString}
							) => {
								const newMinInt = parseInt(newMinString);
								if (newMinInt > max && max !== 0) {
									setMax(newMinInt);
								}
								setMin(newMinInt);
							}}
							type='number'
							value={min}
						/></Table.Cell>
						<Table.Cell collapsing><Input
							min={0}
							onChange={(
								//@ts-ignore
								event,
								{value: newMaxString}
							) => {
								const newMaxInt = parseInt(newMaxString);
								if (newMaxInt !== 0 && newMaxInt < min) {
									setMin(newMaxInt);
								}
								setMax(newMaxInt);
							}}
							type='number'
							value={max}
						/></Table.Cell>
						<Table.Cell collapsing><Radio
							checked={enabled}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setEnabled(checked);
							}}
							toggle
						/></Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={includeInAllText}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setIncludeInAllText(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={fulltext}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setFulltext(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={nGram}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setNgram(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={path}
							onChange={(
								//@ts-ignore
								event :unknown,
								{checked}
							) => {
								setPath(checked);
							}}
							toggle
						/> : null}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={() => onClose()}>Cancel</Button>
			<Button disabled={!!errorMsg} onClick={() => {
				updateOrDeleteProperties({
					active,
					enabled,
					fulltext,
					includeInAllText,
					max,
					min,
					name,
					[INDEX_CONFIG_N_GRAM]: nGram,
					path,
					valueType
				}, isSet(propIndex) ? propIndex : properties.length);
				onClose();
			}} primary>
				<Icon name='save'/>
				{propName ? 'Update field': 'Add field'}
			</Button>
		</Modal.Actions>
	</Modal>;
}; // AddOrEditLocalFieldModal
