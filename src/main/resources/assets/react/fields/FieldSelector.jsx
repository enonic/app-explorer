import {connect, getIn} from 'formik';
import {Select} from '../elements/Select';

//import {toStr} from '../utils/toStr';


export const FieldSelector = connect(({
	formik: {
		values
	},
	//label, // in rest
	multiple = false,
	name = `field${multiple ? 's' : ''}`,
	options = [],
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	placeholder = 'Please select a field',
	fields = options,
	value = values && getIn(values, path) || '',
	...rest
}) => {
	//console.debug(toStr({component: 'FieldSelector', path, value, rest}));
	return <Select
		multiple={multiple}
		name={path}
		options={fields}
		placeholder={placeholder}
		value={value}
		{...rest}
	/>;
}); // FieldSelector
