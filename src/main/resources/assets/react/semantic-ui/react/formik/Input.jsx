import {connect, getIn} from 'formik';
import {Input as SemanticUiReactInput} from 'semantic-ui-react';


//import {toStr} from '../../../utils/toStr';


export const Input = connect(({
	// React
	type = 'text',

	// Various before formik onChange
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,

	// Formik
	formik: {
		setFieldValue,
		values
	},
	onChange = (event, {
		value: newValue
	}) => {
		//console.debug({event, newValue});
		setFieldValue(path, newValue);
	},

	// Various after formik values
	value = getIn(values, path, ''),

	...rest
}) => {
	//console.debug(toStr({path, value, rest}));
	return <SemanticUiReactInput
		name={path}
		onChange={onChange}
		type={type}
		value={value}
		{...rest}
	/>;
});
