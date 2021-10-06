import {VALUE_TYPE_STRING} from '@enonic/js-utils';
import getIn from 'get-value';
import {Dropdown, Input, Message, Modal, Segment} from 'semantic-ui-react';

import {setValue} from 'semantic-ui-react-form';
import {getEnonicContext} from 'semantic-ui-react-form/Context';


export const AddFieldModal = ({
	doClose = () => {},
	globalFieldObj = {},
	globalFieldOptions = [],
	local = true, // false means global
	open
}) => {
	const confirmButton = `Add ${local ? 'loc' : 'glob'}al field`;

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

	const [fieldId, setFieldId] = React.useState('');
	const [name, setName] = React.useState('');

	const msg = usedNames[name] ? <Message
		content={`${name} already added, please input another name.`}
		icon='warning'
		negative
	/> : null;

	let disabled;
	if (local) {
		disabled = (!name || usedNames[name]);
	} else {
		disabled = !fieldId;
	}

	const onConfirm = () => {
		if (!disabled) {
			doClose();
			local
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
			{local
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
		</Segment>}
		header={confirmButton}
		onClose={doClose}
		open={open}
		size='tiny'
	/>;
};
