import {VALUE_TYPE_STRING} from '@enonic/js-utils';
import getIn from 'get-value';
import {
	Dropdown, Form, Input, Message, Modal,
	//Radio,
	Segment
} from 'semantic-ui-react';

import {setValue} from 'semantic-ui-react-form';
import {getEnonicContext} from 'semantic-ui-react-form/Context';

import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDocumentMetaData} from '../utils/notDocumentMetaData';
import {notDoubleDot} from '../utils/notDoubleDot';
import {onlyLettersDigitsUnderscoresAndDots} from '../utils/onlyLettersDigitsUnderscoresAndDots';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
//import {required} from '../utils/required.mjs';


export const AddFieldModal = ({
	doClose = () => {},
	globalFieldObj = {},
	globalFieldOptions = [],
	local = true, // false means global
	open
}) => {
	const [context, dispatch] = getEnonicContext();

	const fields = getIn(context.values, 'fields');
	//console.debug('fields', fields);

	const properties = getIn(context.values, 'properties');
	//console.debug('properties', properties);

	const selectedFields = {};
	const usedNames = {};
	fields.forEach(({fieldId}) => {
		selectedFields[fieldId] = true;
		if (globalFieldObj[fieldId] && globalFieldObj[fieldId].key) { // globalFieldObj is {} until fetched
			usedNames[globalFieldObj[fieldId].key] = true;
		}
	});
	properties.forEach(({name}) => {
		usedNames[name] = true;
	});
	//console.debug('selectedFields', selectedFields);
	//console.debug('usedNames', usedNames);

	const [boolLocal/*, setBoolLocal*/] = React.useState(local);
	const [fieldId, setFieldId] = React.useState('');
	const [name, setName] = React.useState('');

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

	const confirmButton = `Add ${boolLocal ? 'loc' : 'glob'}al field`;

	let disabled;
	if (boolLocal) {
		disabled = !name || errorMsg;
	} else {
		disabled = !fieldId;
	}

	const onConfirm = () => {
		if (!disabled) {
			doClose();
			boolLocal
				? dispatch(setValue({path: `properties.${properties.length}`, value: {
					active: true,
					enabled: true,
					fulltext: true,
					includeInAllText: true,
					max: 0,
					min: 0,
					name,
					ngram: true,
					valueType: VALUE_TYPE_STRING
				}}))
				: dispatch(setValue({path: `fields.${fields.length}`, value: {
					active: true,
					fieldId
				}}));
		}
	}; // onConfirm

	return <Modal
		actions={[{
			content: 'Cancel',
			onClick: doClose
		},{
			content: confirmButton,
			disabled,
			onClick: onConfirm,
			primary: true
		}]}
		closeIcon
		closeOnDimmerClick={false}
		content={<Segment basic>
			<Form>
				{/*<Form.Field>Local <Radio
					checked={!boolLocal}
					onChange={(ignoredEvent,{checked}) => {
						setBoolLocal(!checked);
					}}
					toggle
				/> Global</Form.Field>*/}
				{/*<Form.Field>
					<Dropdown
						onChange={(ignoredEvent,{value: newValue}) => {
							setBoolLocal(newValue);
						}}
						options={[{
							key: true,
							text: 'local',
							value: true
						},{
							key: false,
							text: 'global',
							value: false
						}]}
						selection
						value={boolLocal}
					/>
				</Form.Field>
				*/}
				<Form.Field>
					{boolLocal
						? <>
							<Input
								fluid
								onChange={(event, {value: newValue}) => {
									setName(newValue);
								}}
								onKeyUp={({code}) => {
									if(code === 'Enter') {
										onConfirm();
									}
								}}
								placeholder='Please input a local field name'
							/>
							{msg}
						</>
						: <Dropdown
							onChange={(ignoredEvent,{value: newValue}) => {
								setFieldId(newValue);
							}}
							options={globalFieldOptions.filter(({key: k}) => !selectedFields[k])}
							search
							selection
							placeholder='Please select a global field'
						/>
					}
				</Form.Field>
			</Form>
		</Segment>}
		header={confirmButton}
		onClose={doClose}
		open={open}
		size='tiny'
	/>;
};
