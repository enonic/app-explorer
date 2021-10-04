import getIn from 'get-value';
import {Confirm, Dropdown, Segment} from 'semantic-ui-react';

import {setValue} from 'semantic-ui-react-form';
import {getEnonicContext} from 'semantic-ui-react-form/Context';


export const AddGlobalFieldModal = ({
	globalFieldOptions,
	open,
	setOpen
}) => {
	const [context, dispatch] = getEnonicContext();

	const fields = getIn(context.values, 'fields');
	//console.debug('fields', fields);

	const selectedFields = {};
	fields.forEach(({fieldId}) => {
		selectedFields[fieldId] = true;
	});
	//console.debug('selectedFields', selectedFields);

	const [fieldId, setFieldId] = React.useState('');

	return <Confirm
		closeIcon
		confirmButton='Add global field'
		content={<Segment basic><Dropdown
			onChange={(ignoredEvent,{value: newValue}) => {
				setFieldId(newValue);
			}}
			options={globalFieldOptions.filter(({key: k}) => !selectedFields[k])}
			search
			selection
			placeholder='Please select a global field'
		/></Segment>}
		header='Add global field'
		open={open}
		onCancel={() => setOpen(false)}
		onConfirm={() => {
			setOpen(false);
			dispatch(setValue({path: `fields.${fields.length}`, value: {
				active: true,
				fieldId
			}}));
		}}
		size='tiny'
	/>;
};
