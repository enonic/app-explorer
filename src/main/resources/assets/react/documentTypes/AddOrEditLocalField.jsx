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
	VALUE_TYPE_STRING
} from '@enonic/js-utils';
import getIn from 'get-value';
import {
	Button,
	Dropdown,
	Icon,
	Input,
	Message,
	Modal,
	Popup,
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


export const AddOrEditLocalField = ({
	enabled: propEnabled = true,
	globalFieldObj = {},
	includeInAllText: propIncludeInAllText = true,
	fulltext: propFulltext = true,
	max: propMax = 0,
	min: propMin = 0,
	name: propName = '',
	nGram: propNgram = true,
	path: propPath = false,
	valueType: propValueType = VALUE_TYPE_STRING
}) => {
	//console.debug('propMax', propMax);
	//console.debug('propMin', propMin);
	//console.debug('propName', propName);
	//console.debug('propValueType', propValueType);

	const [context, dispatch] = getEnonicContext();

	const fields = getIn(context.values, 'fields');
	//console.debug('fields', fields);

	const properties = getIn(context.values, 'properties');
	//console.debug('properties', properties);

	const usedNames = {};
	fields.forEach(({fieldId}) => {
		if (globalFieldObj[fieldId] && globalFieldObj[fieldId].key) { // globalFieldObj is {} until fetched
			usedNames[globalFieldObj[fieldId].key] = true;
		}
	});
	properties.forEach(({name}) => {
		usedNames[name] = true;
	});

	const [open, setOpen] = React.useState(false);
	const [enabled, setEnabled] = React.useState(propEnabled);
	const [fulltext, setFulltext] = React.useState(propFulltext);
	const [includeInAllText, setIncludeInAllText] = React.useState(propIncludeInAllText);
	const [max, setMax] = React.useState(propMax);
	const [min, setMin] = React.useState(propMin);
	const [name, setName] = React.useState(propName);
	const [nGram, setNgram] = React.useState(propNgram);
	const [path, setPath] = React.useState(propPath);
	const [valueType, setValueType] = React.useState(propValueType);

	const errorMsg = mustStartWithALowercaseLetter(name)
		|| onlyLettersDigitsUnderscoresAndDots(name)
		|| notDoubleUnderscore(name)
		|| notDoubleDot(name)
		|| notDocumentMetaData(name)
		|| (usedNames[name] ? `${name} already added, please input another name.` : ''); // '' = falsy

	const msg =  errorMsg ? <Message
		content={errorMsg}
		icon='warning'
		negative
	/> : null;

	const header = `${propName ? 'Edit' : 'Add'} local field`;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		open={open}
		size='large' // small is too narrow
		trigger={<Popup
			content={header}
			inverted
			trigger={<Button
				icon
				onClick={() => setOpen(true)}>
				<Icon
					color={propName ? 'blue' : 'green'}
					name={propName ? 'edit' : 'plus'}
				/>{propName ? '' : ' Add local field'}</Button>}
		/>}
	>
		<Modal.Header as='h1' className='ui'>{header}</Modal.Header>
		<Modal.Content>
			<Table celled compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell collapsing>Value type</Table.HeaderCell>
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
						<Table.Cell>{propName
							? propName
							: <Input
								onChange={(event, {value: newName}) => {
									setName(newName);
								}}
								placeholder='Please input a local field name'
								value={name}
							/>}</Table.Cell>
						<Table.Cell collapsing><Dropdown
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
							onChange={(event, {value: newMin}) => {
								setMin(newMin);
							}}
							type='number'
							value={min}
						/></Table.Cell>
						<Table.Cell collapsing><Input
							min={0}
							onChange={(event, {value: newMax}) => {
								setMax(newMax);
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
			{msg}
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={() => setOpen(false)}>Cancel</Button>
			<Button disabled={!!errorMsg} onClick={() => {
				dispatch(setValue({
					path: `properties.${properties.length}`,
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
				setOpen(false);
			}} primary><Icon name='save'/> Save</Button>
		</Modal.Actions>
	</Modal>;
}; // AddOrEditLocalField
