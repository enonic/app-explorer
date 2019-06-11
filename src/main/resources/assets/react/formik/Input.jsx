import {connect, Field, getIn} from 'formik';

//import {toStr} from '../utils/toStr';


export const Input = connect(({
	formik: {
		values
	},
	autoComplete = 'off',
	className,
	label,
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	type = 'text',
	value = getIn(values, path) || '',
	size = Math.max(25, (value && value.length || 1)),
	...rest
}) => {
	//console.debug(toStr({component: 'Formik/Input', autoComplete, label, parentPath, name, path, type, size, value, rest}));
	return <Field
		autoComplete={autoComplete}
		name={path}
		size={size}
		type={type}
		value={value}
		{...rest}
	/>;
});
