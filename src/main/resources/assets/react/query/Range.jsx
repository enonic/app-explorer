import {connect, getIn} from 'formik';

import {FieldSelector} from '../fields/FieldSelector';

import {TextInput} from '../formik/TextInput';

import {Checkbox} from '../semantic-ui/Checkbox';

//import {toStr} from '../utils/toStr';


export const Range = connect(({
	fields,
	formik: {
		values
	},
	name = 'range',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(values, path)
}) => {
	/*console.debug(toStr({
		component: 'Range',
		parentPath,
		name,
		path,
		value
	}));*/
	return <>
		<FieldSelector
			parentPath={path}
			fields={fields}
		/>
		<TextInput
			name='from'
			parentPath={path}
			placeholder='From'
		/>
		<TextInput
			name='to'
			parentPath={path}
			placeholder='To'
		/>
		<Checkbox
			label='Include from?'
			name='includeFrom'
			parentPath={path}
		/>
		<Checkbox
			label='Include to?'
			name='includeTo'
			parentPath={path}
		/>
	</>;
}); // Range
