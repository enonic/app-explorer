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
	isSet
} from '@enonic/js-utils';
import getIn from 'get-value';
import {
	Button,
	Dropdown,
	Icon,
	Input,
	Message,
	Modal,
	Radio,
	Table
} from 'semantic-ui-react';
import {setValue} from 'semantic-ui-react-form';
import {getEnonicContext} from 'semantic-ui-react-form/Context';

import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDocumentMetaData} from '../utils/notDocumentMetaData';
import {notDoubleDot} from '../utils/notDoubleDot';
import {onlyLettersDigitsUnderscoresAndDots} from '../utils/onlyLettersDigitsUnderscoresAndDots';
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
	globalFieldObj = {},
	onClose = () => {},
	state: {
		initialValues: {
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
		} = {},
		open = false
	} = {}
}) => {
	//console.debug('propIncludeInAllText', propIncludeInAllText);
	//console.debug('propMax', propMax);
	//console.debug('propMin', propMin);
	//console.debug('propName', propName);
	//console.debug('propValueType', propValueType);

	const [context, dispatch] = getEnonicContext();

	const properties = getIn(context.values, 'properties');
	//console.debug('properties', properties);

	const usedNames = {};
	/*Object.keys(globalFieldObj).forEach((name) => {
		usedNames[name] = true;
	});*/
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

	const [nameTouched, setNameTouched] = React.useState(false);
	//console.debug('includeInAllText', includeInAllText);
	//console.debug('name', name);

	const [header, setHeader] = React.useState(/*propName
		? globalFieldObj[propName]
			? `Override global field ${propName}`
			: `Edit local field ${propName}`
		: 'Add local field'
	*/);

	React.useEffect(() => {
		//console.debug('globalFieldObj, propName or name changed, updating header');
		setHeader(propName
			? globalFieldObj[propName]
				? `Override global field ${propName}`
				: `Edit local field ${propName}`
			: (name && globalFieldObj[name])
				? `Override global field ${name}`
				: 'Add local field');
	}, [globalFieldObj, propName, name]);

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
				|| onlyLettersDigitsUnderscoresAndDots(name)
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
		open={open}
		size='large' // small is too narrow
	>
		<Modal.Header as='h1' className='ui'>{header}</Modal.Header>
		<Modal.Content>
			<Input
				disabled={propName}
				fluid
				label='Name'
				onChange={(event, {value: newName}) => {
					setName(newName);
					setNameTouched(true);
				}}
				placeholder='Please input a local field name'
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
							onChange={(event, {value: newValueType}) => {
								setValueType(newValueType);
							}}
							options={OPTIONS_VALUE_TYPES}
							search
							selection
							value={valueType}
						/></Table.Cell>
						<Table.Cell collapsing><Input
							min={0}
							onChange={(event, {value: newMinString}) => {
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
							onChange={(event, {value: newMaxString}) => {
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
							onChange={(event, {checked}) => {
								setEnabled(checked);
							}}
							toggle
						/></Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={includeInAllText}
							onChange={(event, {checked}) => {
								setIncludeInAllText(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={fulltext}
							onChange={(event, {checked}) => {
								setFulltext(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={nGram}
							onChange={(event, {checked}) => {
								setNgram(checked);
							}}
							toggle
						/> : null}</Table.Cell>
						<Table.Cell collapsing>{enabled ? <Radio
							checked={path}
							onChange={(event, {checked}) => {
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
				dispatch(setValue({
					path: `properties.${isSet(propIndex) ? propIndex : properties.length}`,
					value: {
						active: true,
						enabled,
						fulltext,
						includeInAllText,
						max,
						min,
						name,
						[INDEX_CONFIG_N_GRAM]: nGram,
						path,
						valueType
					}}));
				onClose();
			}} primary><Icon name='save'/> {propName
					? isSet(propIndex)
						? 'Update local field'
						: 'Override global field'
					: globalFieldObj[name]
						? 'Override global field'
						: 'Add local field'
				}</Button>
		</Modal.Actions>
	</Modal>;
}; // AddOrEditLocalFieldModal
